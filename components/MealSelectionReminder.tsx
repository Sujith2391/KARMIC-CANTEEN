import React, { useState, useEffect } from 'react';
import { User, DailyMenu, MealConfirmation, MealType } from '../types';
import { getConfirmationsForWeek, getMenuForDay } from '../services/api';
import { BellIcon, CloseIcon } from './icons';

interface MealSelectionReminderProps {
  user: User;
  simulatedTime: { hour: number; minute: number };
}

const MealSelectionReminder: React.FC<MealSelectionReminderProps> = ({ user, simulatedTime }) => {
  const [showReminder, setShowReminder] = useState(false);
  const [hasConfirmedForTomorrow, setHasConfirmedForTomorrow] = useState(true); // Assume confirmed initially
  const [tomorrowsMenu, setTomorrowsMenu] = useState<DailyMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];
    const weekStart = new Date(tomorrow);
    weekStart.setDate(tomorrow.getDate() - tomorrow.getDay() + 1);

    const checkConfirmationAndFetchMenu = async () => {
      setIsLoading(true);
      try {
        const confirmations = await getConfirmationsForWeek(user.id, weekStart);
        const tomorrowConfirmation = confirmations[tomorrowDateString];
        if (tomorrowConfirmation) {
          const hasSelectedAnyMeal = tomorrowConfirmation.Breakfast || tomorrowConfirmation.Lunch || tomorrowConfirmation.Snacks || tomorrowConfirmation.Dinner;
          setHasConfirmedForTomorrow(hasSelectedAnyMeal);
        } else {
          setHasConfirmedForTomorrow(false);
        }

        const menu = await getMenuForDay(tomorrow);
        setTomorrowsMenu(menu);

      } catch (error) {
        console.error("Could not check tomorrow's confirmation or menu", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConfirmationAndFetchMenu();
  }, [user.id]);
  
  useEffect(() => {
    // Show to all employees after 12:30 PM if they haven't selected any meal for tomorrow
    const shouldShow =
      simulatedTime.hour === 12 &&
      simulatedTime.minute >= 30 &&
      !hasConfirmedForTomorrow;
    
    setShowReminder(shouldShow);
  }, [simulatedTime, hasConfirmedForTomorrow]);
  
  const renderMenu = () => {
    if (isLoading) return <p className="text-center p-4">Loading menu...</p>;
    if (!tomorrowsMenu) return <p className="text-center p-4">Menu for tomorrow is not available yet.</p>;

    return (
        <div className="space-y-3 max-h-60 overflow-y-auto bg-slate-50 p-3 rounded-lg border">
            {Object.values(MealType).map(mealType => (
                tomorrowsMenu[mealType].length > 0 && (
                    <div key={mealType}>
                        <h4 className="font-bold text-primary">{mealType}</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600">
                            {tomorrowsMenu[mealType].map(item => <li key={item.id}>{item.name}</li>)}
                        </ul>
                    </div>
                )
            ))}
        </div>
    );
  }

  if (!showReminder) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-onSurface">Time to Select Tomorrow's Meals!</h3>
            </div>
          </div>
          <button
            onClick={() => setShowReminder(false)}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-4 text-slate-600">
          It's past 12:30 PM. Please review tomorrow's menu below and make your selections to help us plan ahead and reduce waste.
        </p>

        {renderMenu()}

        <button
          onClick={() => setShowReminder(false)}
          className="w-full mt-4 px-4 py-2 bg-primary text-onPrimary font-semibold rounded-lg shadow-md hover:bg-primary-dark"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

export default MealSelectionReminder;