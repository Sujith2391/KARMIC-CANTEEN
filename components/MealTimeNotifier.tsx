import React, { useState, useEffect } from 'react';
import { User, WorkLocation, DailyMenu, MealType, MenuItem } from '../types';
import { getWorkPlanForDate, getMenuForDay } from '../services/api';
import { CloseIcon, BreakfastIcon, LunchIcon, SnackIcon, DinnerIcon } from './icons';

interface MealTimeNotifierProps {
  user: User;
  simulatedTime: { hour: number; minute: number };
}

const MEAL_TIMES: Record<MealType, { hour: number; minute: number; icon: React.FC<{ className?: string }> }> = {
  [MealType.BREAKFAST]: { hour: 8, minute: 30, icon: BreakfastIcon },
  [MealType.LUNCH]: { hour: 12, minute: 0, icon: LunchIcon },
  [MealType.SNACKS]: { hour: 16, minute: 30, icon: SnackIcon },
  [MealType.DINNER]: { hour: 19, minute: 30, icon: DinnerIcon },
};

const MealTimeNotifier: React.FC<MealTimeNotifierProps> = ({ user, simulatedTime }) => {
  const [activeNotification, setActiveNotification] = useState<{ mealType: MealType; menu: MenuItem[] } | null>(null);
  const [todaysLocation, setTodaysLocation] = useState<WorkLocation | null>(null);
  const [todaysMenu, setTodaysMenu] = useState<DailyMenu | null>(null);
  const [shownNotifications, setShownNotifications] = useState<MealType[]>([]);
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  useEffect(() => {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];

    // Reset notifications if the day changes
    if (today.getDate() !== currentDay) {
        setShownNotifications([]);
        setCurrentDay(today.getDate());
    }
    
    getWorkPlanForDate(user.id, todayDateString)
      .then(plan => setTodaysLocation(plan ? plan.location : user.workLocation))
      .catch(console.error);
      
    getMenuForDay(today)
      .then(setTodaysMenu)
      .catch(console.error);

  }, [user.id, user.workLocation, simulatedTime, currentDay]);

  useEffect(() => {
    if (todaysLocation !== WorkLocation.MAIN_OFFICE || !todaysMenu) {
      return;
    }

    for (const mealType of Object.values(MealType)) {
      const mealTime = MEAL_TIMES[mealType];
      if (
        simulatedTime.hour === mealTime.hour &&
        simulatedTime.minute === mealTime.minute &&
        !shownNotifications.includes(mealType)
      ) {
        setActiveNotification({
          mealType,
          menu: todaysMenu[mealType],
        });
        setShownNotifications(prev => [...prev, mealType]);
      }
    }
  }, [simulatedTime, todaysLocation, todaysMenu, shownNotifications]);

  if (!activeNotification) {
    return null;
  }

  const Icon = MEAL_TIMES[activeNotification.mealType].icon;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-onSurface">{activeNotification.mealType} is Ready!</h3>
            </div>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
            <p className="text-slate-600 mb-2">Today's {activeNotification.mealType.toLowerCase()} menu includes:</p>
            <div className="bg-slate-50 p-3 rounded-lg border">
                {activeNotification.menu.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-700 font-medium">
                        {activeNotification.menu.map(item => <li key={item.id}>{item.name}</li>)}
                    </ul>
                ) : (
                    <p className="text-slate-500">Menu not available.</p>
                )}
            </div>
        </div>
        <button
          onClick={() => setActiveNotification(null)}
          className="w-full px-4 py-2 bg-primary text-onPrimary font-semibold rounded-lg shadow-md hover:bg-primary-dark"
        >
          Enjoy Your Meal!
        </button>
      </div>
    </div>
  );
};

export default MealTimeNotifier;
