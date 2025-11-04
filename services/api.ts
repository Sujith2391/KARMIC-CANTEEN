// Fix: Added WorkforceDistribution to the import from types.ts.
import { User, UserRole, DailyMenu, MealType, MealConfirmation, ConsolidatedReport, MenuItem, EmployeeConfirmationDetails, Feedback, Notification, DailyWorkPlan, WorkLocation, WorkforceDistribution } from '../types';
import { db, collection, doc, getDoc, getDocs, updateDoc, onSnapshot, addDoc, deleteDoc, query, where, setDoc } from './firebase';

// --- API FUNCTIONS (Refactored for Firestore-like API) ---

export const getAllUsers = async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as User);
}

export const getEmployees = async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
    return allUsers.filter(user => user.role === UserRole.EMPLOYEE);
}

export const getMenuForDay = async (date: Date): Promise<DailyMenu> => {
    const dayOfWeek = date.getDay();
    const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
    const menuSnap = await getDoc(menuDocRef);

    if (!menuSnap.exists()) {
        throw new Error(`Menu for day ${dayOfWeek} not found`);
    }

    const dateString = date.toISOString().split('T')[0];
    
    const menuTemplate = menuSnap.data();
    const menu: DailyMenu = {
        date: dateString,
        [MealType.BREAKFAST]: menuTemplate?.[MealType.BREAKFAST] || [],
        [MealType.LUNCH]: menuTemplate?.[MealType.LUNCH] || [],
        [MealType.SNACKS]: menuTemplate?.[MealType.SNACKS] || [],
        [MealType.DINNER]: menuTemplate?.[MealType.DINNER] || [],
    };
    return menu;
};

const getConfirmationForDate = async (userId: string, date: string): Promise<MealConfirmation> => {
    const confirmationId = `${userId}-${date}`;
    const confirmationDocRef = doc(db, 'confirmations', confirmationId);
    const confirmationSnap = await getDoc(confirmationDocRef);

    if (confirmationSnap.exists()) {
        return confirmationSnap.data() as MealConfirmation;
    }

    return {
        userId,
        date,
        [MealType.BREAKFAST]: false,
        [MealType.LUNCH]: false,
        [MealType.SNACKS]: false,
        [MealType.DINNER]: false,
    };
};

export const getConfirmationsForWeek = async (userId: string, weekStartDate: Date): Promise<Record<string, MealConfirmation>> => {
    const confirmations: Record<string, MealConfirmation> = {};
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStartDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        confirmations[dateString] = await getConfirmationForDate(userId, dateString);
    }
    return confirmations;
};


export const updateConfirmation = async (userId: string, date: string, mealType: MealType, status: boolean): Promise<MealConfirmation> => {
  const confirmationId = `${userId}-${date}`;
  const confirmationDocRef = doc(db, 'confirmations', confirmationId);

  const currentConfirmation = await getConfirmationForDate(userId, date);
  const payload = { ...currentConfirmation, [mealType]: status };
  
  await setDoc(confirmationDocRef, payload);
  const updatedDoc = await getDoc(confirmationDocRef);
  return updatedDoc.data() as MealConfirmation;
};


export const getConsolidatedReport = async (): Promise<ConsolidatedReport[]> => {
    const todaysDateString = new Date().toISOString().split('T')[0];
    const confirmationsSnapshot = await getDocs(collection(db, 'confirmations'));
    const todaysConfirmations = confirmationsSnapshot.docs
        .map(d => d.data() as MealConfirmation)
        .filter(c => c.date === todaysDateString);

    const report: ConsolidatedReport[] = [];
    const mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.SNACKS, MealType.DINNER];

    mealTypes.forEach(mealType => {
        const confirmed = todaysConfirmations.filter(c => c[mealType]).length;
        report.push({
            date: todaysDateString,
            mealType,
            confirmed,
        });
    });

    return report;
}

export const getEmployeeConfirmations = async (): Promise<EmployeeConfirmationDetails[]> => {
    const todaysDateString = new Date().toISOString().split('T')[0];
    const [employees, confirmationsSnapshot] = await Promise.all([
        getEmployees(),
        getDocs(collection(db, 'confirmations'))
    ]);
    const todaysConfirmations = confirmationsSnapshot.docs
        .map(d => d.data() as MealConfirmation)
        .filter(c => c.date === todaysDateString);

    const details = employees.map(employee => {
        let confirmation = todaysConfirmations.find(c => c.userId === employee.id);

        if (!confirmation) {
            confirmation = {
                userId: employee.id,
                date: todaysDateString,
                [MealType.BREAKFAST]: false,
                [MealType.LUNCH]: false,
                [MealType.SNACKS]: false,
                [MealType.DINNER]: false,
            };
        }
        
        return { ...employee, confirmation };
    });
    return details;
};

// Fix: Added getWasteAnalytics function to provide data for the WasteChart component.
export const getWasteAnalytics = async (): Promise<ConsolidatedReport[]> => {
    const analytics: ConsolidatedReport[] = [];
    const confirmationsSnapshot = await getDocs(collection(db, 'confirmations'));
    const allConfirmations = confirmationsSnapshot.docs.map(d => d.data() as MealConfirmation);

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        const dailyConfirmations = allConfirmations.filter(c => c.date === dateString);
        const confirmedForLunch = dailyConfirmations.filter(c => c[MealType.LUNCH]).length;

        analytics.push({
            date: dateString,
            mealType: MealType.LUNCH,
            confirmed: confirmedForLunch,
        });
    }

    return analytics.reverse(); // To show oldest date first
};

export const onDashboardUpdate = (callback: (data: { report: ConsolidatedReport[], details: EmployeeConfirmationDetails[] }) => void) => {
    const unsubConfirmations = onSnapshot(collection(db, 'confirmations'), async () => {
        const [report, details] = await Promise.all([
            getConsolidatedReport(),
            getEmployeeConfirmations()
        ]);
        callback({ report, details });
    });

    return unsubConfirmations;
};

export const updateMenuItem = async (dayOfWeek: number, mealType: MealType, item: MenuItem): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    const mealItems = dayMenu[mealType] as MenuItem[];
    const itemIndex = mealItems.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
      mealItems[itemIndex] = item;
      await updateDoc(menuDocRef, { [mealType]: mealItems });
    }
  }
  return getMenuForDay(new Date()); // Return today's menu for simplicity, could be adapted
}

export const addMenuItem = async (dayOfWeek: number, mealType: MealType, item: Omit<MenuItem, 'id'>): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    const mealItems = dayMenu[mealType] as MenuItem[];
    const newItem = { ...item, id: `item-${Date.now()}`};
    mealItems.push(newItem);
    await updateDoc(menuDocRef, { [mealType]: mealItems });
  }
  return getMenuForDay(new Date());
}

export const deleteMenuItem = async (dayOfWeek: number, mealType: MealType, itemId: string): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    let mealItems = dayMenu[mealType] as MenuItem[];
    mealItems = mealItems.filter(item => item.id !== itemId);
    await updateDoc(menuDocRef, { [mealType]: mealItems });
  }
  return getMenuForDay(new Date());
}

// Fix: Removed local WorkforceDistribution interface definition as it has been moved to types.ts.
export const getDailyWorkforceDistribution = async (): Promise<WorkforceDistribution> => {
    const todaysDateString = new Date().toISOString().split('T')[0];
    const employees = await getEmployees();
    const workPlansSnapshot = await getDocs(collection(db, 'dailyWorkPlans'));
    const todaysPlans = workPlansSnapshot.docs
        .map(d => d.data() as DailyWorkPlan)
        .filter(p => p.date === todaysDateString);

    const planMap = new Map(todaysPlans.map(p => [p.userId, p.location]));

    const distribution = {
        [WorkLocation.MAIN_OFFICE]: 0,
        [WorkLocation.WFH]: 0,
        [WorkLocation.OTHER]: 0,
        [WorkLocation.ON_LEAVE]: 0,
    };

    employees.forEach(employee => {
        const location = planMap.get(employee.id) || employee.workLocation;
        if (distribution.hasOwnProperty(location)) {
            distribution[location as WorkLocation]++;
        }
    });

    return { ...distribution, total: employees.length };
};


// --- USER AUTH & CRUD ---

export const registerUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userData.email.toLowerCase()));
    const existingUser = await getDocs(q);

    if (!existingUser.docs.length) {
        const docRef = await addDoc(collection(db, 'users'), userData);
        return { ...userData, id: docRef.id };
    } else {
        throw new Error('User with this email already exists.');
    }
};

export const loginUser = async (email: string, pass: string): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const userSnapshot = await getDocs(q);

    if (userSnapshot.empty) {
        return null; // User not found
    }

    const user = userSnapshot.docs[0].data() as User;
    if (user.password === pass) {
        return user;
    }
    
    return null; // Incorrect password
};


export const updateUser = async (userId: string, updatedData: Partial<User>): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updatedData);
};

export const deleteUser = async (userId: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
};

export const onUsersUpdate = (callback: (users: User[]) => void) => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map((doc: any) => doc.data() as User);
        callback(users);
    });
    return unsub;
};

// --- FEEDBACK FUNCTIONS ---

export const addFeedback = async (feedbackData: Omit<Feedback, 'id' | 'date'>): Promise<void> => {
    const newFeedback = { ...feedbackData, date: new Date().toISOString().split('T')[0] };
    await addDoc(collection(db, 'feedback'), newFeedback);
};

export const onFeedbackUpdate = (callback: (feedback: Feedback[]) => void) => {
    const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
        const feedbackItems = snapshot.docs.map((doc: any) => doc.data() as Feedback);
        callback(feedbackItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    return unsub;
};

// --- NOTIFICATION FUNCTIONS ---
export const sendNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp'>): Promise<void> => {
    const newNotification = { ...notificationData, timestamp: Date.now() };
    await addDoc(collection(db, 'notifications'), newNotification);
};

export const onNotificationsUpdate = (callback: (notifications: Notification[]) => void) => {
    const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const items = snapshot.docs.map((d: any) => d.data() as Notification);
        callback(items.sort((a, b) => b.timestamp - a.timestamp));
    });
    return unsub;
};

export const respondToNotification = async (notificationId: string, userId: string, response: 'yes' | 'no'): Promise<void> => {
    const notifDocRef = doc(db, 'notifications', notificationId);
    const notifSnap = await getDoc(notifDocRef);
    if (notifSnap.exists()) {
        const currentNotif = notifSnap.data() as Notification;
        const newResponses = { ...currentNotif.responses, [userId]: response };
        await updateDoc(notifDocRef, { responses: newResponses });
    }
};

// --- DAILY WORK PLAN FUNCTIONS ---
export const getWorkPlanForDate = async (userId: string, date: string): Promise<DailyWorkPlan | null> => {
    const id = `${userId}-${date}`;
    const docRef = doc(db, 'dailyWorkPlans', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as DailyWorkPlan;
    }
    return null;
};

export const updateWorkPlan = async (userId: string, date: string, location: WorkLocation): Promise<void> => {
    const id = `${userId}-${date}`;
    const docRef = doc(db, 'dailyWorkPlans', id);
    const plan: Omit<DailyWorkPlan, 'id'> = { userId, date, location };
    await setDoc(docRef, plan);
};

export const onWorkPlanUpdateForDate = (userId: string, date: string, callback: (plan: DailyWorkPlan | null) => void) => {
    const id = `${userId}-${date}`;
    const unsub = onSnapshot(collection(db, 'dailyWorkPlans'), (snapshot) => {
        const docData = snapshot.docs.find((d: any) => d.data().userId === userId && d.data().date === date);
        if (docData) {
            callback(docData.data() as DailyWorkPlan);
        } else {
            callback(null);
        }
    });
    return unsub;
};