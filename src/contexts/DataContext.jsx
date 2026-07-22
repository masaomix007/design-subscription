import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
    collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc,
    getDocs, query, where, runTransaction
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [currentUserCustomer, setCurrentUserCustomer] = useState(null);
    const [plans, setPlans] = useState([]);
    const [works, setWorks] = useState({});
    const [transactions, setTransactions] = useState({});
    const [worksCatalog, setWorksCatalog] = useState([]);
    const [loading, setLoading] = useState(true); // 初期状態はtrue
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setAuthLoading(true);
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                setUser(userDocSnap.exists() 
                    ? { ...currentUser, ...userDocSnap.data() } 
                    : { ...currentUser, role: 'customer' });
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (authLoading || !user) {
            if (!user) setLoading(false);
            return;
        }

        setLoading(true);

        // 全てのデータソースの初期読み込み状態を追跡
        const sources = ['customers', 'plans', 'works', 'transactions', 'worksCatalog'];
        let loadedSources = 0;

        const checkLoadingComplete = () => {
            loadedSources++;
            if (loadedSources === sources.length) {
                setLoading(false);
            }
        };

        const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
            const customerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCustomers(customerList);
            if (user && user.role === 'customer' && user.email) {
                const matchingCustomer = customerList.find(c => 
                    (Array.isArray(c.email) && c.email.includes(user.email)) || c.email === user.email
                );
                setCurrentUserCustomer(matchingCustomer || null);
            }
            checkLoadingComplete();
        }, (error) => { console.error("Customer snapshot failed: ", error); checkLoadingComplete(); });

        const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
            setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            checkLoadingComplete();
        }, (error) => { console.error("Plans snapshot failed: ", error); checkLoadingComplete(); });

        const unsubWorks = onSnapshot(collection(db, 'works'), (snapshot) => {
            const worksData = {};
            snapshot.docs.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                if (data.deleted === true) return;
                const cId = data.customerId || data.clientId;
                if (cId) {
                    if (!worksData[cId]) worksData[cId] = [];
                    worksData[cId].push(data);
                }
            });
            setWorks(worksData);
            checkLoadingComplete();
        }, (error) => { console.error("Works snapshot failed: ", error); checkLoadingComplete(); });

        const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
            const transData = {};
            snapshot.docs.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                const cId = data.customerId;
                if (cId) {
                    if (!transData[cId]) transData[cId] = [];
                    transData[cId].push(data);
                }
            });
            setTransactions(transData);
            checkLoadingComplete();
        }, (error) => { console.error("Transactions snapshot failed: ", error); checkLoadingComplete(); });

        const unsubCatalog = onSnapshot(collection(db, 'worksCatalog'), (snapshot) => {
            setWorksCatalog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            checkLoadingComplete();
        }, (error) => { console.error("WorksCatalog snapshot failed: ", error); checkLoadingComplete(); });

        return () => {
            unsubCustomers();
            unsubPlans();
            unsubWorks();
            unsubTransactions();
            unsubCatalog();
        };
    }, [user, authLoading]);

    const addWork = async (customerId, workData) => {
        const workRef = await addDoc(collection(db, 'works'), {
            ...workData,
            customerId: customerId,
            createdAt: serverTimestamp()
        });
        if (workData.pointsUsed > 0) {
            await addDoc(collection(db, 'transactions'), {
                customerId: customerId,
                type: 'consumption',
                description: `実績消費: ${workData.name}`,
                points: -Math.abs(Number(workData.pointsUsed)),
                date: new Date().toISOString(),
                workId: workRef.id
            });
        }
    };

    const updateWork = async (workId, workData) => {
        const workRef = doc(db, 'works', workId);
        await updateDoc(workRef, {
            ...workData,
            updatedAt: serverTimestamp()
        });
    };

    const deleteWorkWithRefund = async (customerId, workId) => {
        const workRef = doc(db, 'works', workId);
        const refundRef = doc(db, 'transactions', `work-refund-${workId}`);
        const originalsQuery = query(
            collection(db, 'transactions'),
            where('workId', '==', workId)
        );

        const [workBeforeTransaction, originalTransactionSnapshots] = await Promise.all([
            getDoc(workRef),
            getDocs(originalsQuery),
        ]);

        if (!workBeforeTransaction.exists()) {
            throw new Error('対象の制作実績が見つかりません。');
        }

        const workBeforeTransactionData = workBeforeTransaction.data();
        const workCustomerIdBeforeTransaction = workBeforeTransactionData.customerId
            || workBeforeTransactionData.clientId;
        if (workCustomerIdBeforeTransaction !== customerId) {
            throw new Error('制作実績の顧客情報が一致しません。');
        }

        const originalTransactions = originalTransactionSnapshots.docs.filter((snapshot) => {
            const data = snapshot.data();
            return data.customerId === customerId
                && data.type === 'consumption'
                && Number(data.points) < 0;
        });
        const pointsUsedBeforeTransaction = Number(workBeforeTransactionData.pointsUsed) || 0;

        if (pointsUsedBeforeTransaction > 0 && originalTransactions.length === 0) {
            throw new Error('元のポイント消費取引を特定できないため、削除を中止しました。');
        }
        if (originalTransactions.length > 1) {
            throw new Error('元のポイント消費取引が複数あるため、削除を中止しました。');
        }

        const originalTransactionRef = originalTransactions[0]?.ref || null;

        return runTransaction(db, async (transaction) => {
            const workSnapshot = await transaction.get(workRef);
            const refundSnapshot = await transaction.get(refundRef);
            const originalTransactionSnapshot = originalTransactionRef
                ? await transaction.get(originalTransactionRef)
                : null;

            if (!workSnapshot.exists()) {
                throw new Error('対象の制作実績が見つかりません。');
            }

            const work = workSnapshot.data();
            const workCustomerId = work.customerId || work.clientId;
            if (workCustomerId !== customerId) {
                throw new Error('制作実績の顧客情報が一致しません。');
            }
            if (work.deleted === true || work.pointRefunded === true || refundSnapshot.exists()) {
                throw new Error('この制作実績は削除済み、またはポイント返還済みです。');
            }

            const pointsUsed = Number(work.pointsUsed) || 0;

            if (pointsUsed > 0 && !originalTransactionSnapshot) {
                throw new Error('元のポイント消費取引を特定できないため、削除を中止しました。');
            }

            let originalTransactionData = null;
            if (originalTransactionSnapshot) {
                if (!originalTransactionSnapshot.exists()) {
                    throw new Error('元のポイント消費取引が削除されているため、削除を中止しました。');
                }

                originalTransactionData = originalTransactionSnapshot.data();
                if (
                    originalTransactionData.workId !== workId
                    || originalTransactionData.customerId !== customerId
                    || originalTransactionData.type !== 'consumption'
                    || !(Number(originalTransactionData.points) < 0)
                ) {
                    throw new Error('元のポイント消費取引の内容が変更されているため、削除を中止しました。');
                }
            }

            const refundPoints = originalTransactionData
                ? Math.abs(Number(originalTransactionData.points))
                : 0;
            const deletionData = {
                deleted: true,
                deletedAt: serverTimestamp(),
                pointRefunded: refundPoints > 0,
                updatedAt: serverTimestamp(),
            };

            if (auth.currentUser?.uid) {
                deletionData.deletedBy = auth.currentUser.uid;
            }

            if (originalTransactionSnapshot) {
                deletionData.refundTransactionId = refundRef.id;
                transaction.set(refundRef, {
                    customerId,
                    type: 'work_refund',
                    description: `制作実績削除によるポイント返還：${work.name || '名称未設定'}`,
                    points: refundPoints,
                    date: new Date().toISOString(),
                    workId,
                    originalTransactionId: originalTransactionSnapshot.id,
                    memo: '制作実績の削除に伴う自動返還',
                    createdAt: serverTimestamp(),
                });
            }

            transaction.update(workRef, deletionData);

            return {
                refundPoints,
                originalTransactionId: originalTransactionSnapshot?.id || null,
            };
        });
    };

    const getCustomerPlanDetails = (planId) => {
        const plan = plans.find(p => p.id === planId);
        return {
            planName: plan ? plan.name : '未設定',
            monthlyPoints: plan ? plan.monthlyPoints : 0,
            canCarryOver: plan ? plan.canCarryOver : false
        };
    };

    const value = {
        user, customers, currentUserCustomer, plans, works, tasks: works, 
        transactions, worksCatalog, loading, authLoading,
        addWork, updateWork, deleteWorkWithRefund,
        addTask: addWork, 
        updateTask: updateWork,
        getCustomerPlanDetails
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
