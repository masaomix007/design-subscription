import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [works, setWorks] = useState({}); 
    const [transactions, setTransactions] = useState({});
    const [worksCatalog, setWorksCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
            setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // --- 制作実績 (works) の読み込みとソート ---
        const unsubWorks = onSnapshot(collection(db, 'works'), (snapshot) => {
            const worksData = {};
            snapshot.docs.forEach(doc => {
                const data = { id: doc.id, ...doc.data() };
                const cId = data.customerId || data.clientId;
                if (cId) {
                    if (!worksData[cId]) worksData[cId] = [];
                    worksData[cId].push(data);
                }
            });
            // 顧客ごとに「実施日」の新しい順に並び替え
            Object.keys(worksData).forEach(cId => {
                worksData[cId].sort((a, b) => {
                    const dateA = new Date(a.dateUsed || a.createdAt?.seconds * 1000 || 0);
                    const dateB = new Date(b.dateUsed || b.createdAt?.seconds * 1000 || 0);
                    return dateB - dateA;
                });
            });
            setWorks(worksData);
        });

        // --- 取引履歴 (transactions) の読み込みとソート ---
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
            // 顧客ごとに「日付」の新しい順に並び替え
            Object.keys(transData).forEach(cId => {
                transData[cId].sort((a, b) => {
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);
                    return dateB - dateA;
                });
            });
            setTransactions(transData);
        });

        const unsubCatalog = onSnapshot(collection(db, 'worksCatalog'), (snapshot) => {
            setWorksCatalog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
        return () => {
            unsubCustomers(); unsubPlans(); unsubWorks(); unsubTransactions(); unsubCatalog();
        };
    }, [user]);

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

    const updateWork = async (customerId, workId, workData) => {
        const workRef = doc(db, 'works', workId);
        await updateDoc(workRef, {
            ...workData,
            updatedAt: serverTimestamp()
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
        user, customers, plans, works, tasks: works, 
        transactions, worksCatalog, loading,
        addWork, updateWork,
        addTask: addWork,
        updateTask: updateWork,
        getCustomerPlanDetails
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);