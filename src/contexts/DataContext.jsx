import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
    collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, getDoc
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
        addWork, updateWork, 
        addTask: addWork, 
        updateTask: updateWork,
        getCustomerPlanDetails
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};