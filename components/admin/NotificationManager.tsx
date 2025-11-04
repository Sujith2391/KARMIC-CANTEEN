import React, { useState } from 'react';
import { DailyMenu, MealType } from '../../types';
import { sendNotification, getMenuForDay } from '../../services/api';
import { CalendarIcon } from '../icons';

const NotificationManager: React.FC = () => {
  const [isPublishing, setIsPublishing] = useState(false);
  
  const formatMenuForNotification = (menu: DailyMenu): string => {
    let message = '';
    const mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.SNACKS, MealType.DINNER];
    mealTypes.forEach(mealType => {
        if (menu[mealType].length > 0) {
            message += `${mealType}: ${menu[mealType].map(item => item.name).join(', ')}. `;
        }
    });
    return message.trim();
  };

  const handlePublishMenu = async () => {
    if (!window.confirm("Are you sure you want to publish tomorrow's menu? This will only notify employees planned to be in the office.")) {
        return;
    }
    setIsPublishing(true);
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const menu = await getMenuForDay(tomorrow);
        const message = formatMenuForNotification(menu);

        if (!message) {
            alert("Tomorrow's menu is empty. Cannot publish.");
            setIsPublishing(false);
            return;
        }

        const title = `Menu for Tomorrow (${tomorrow.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })})`;
        
        // Canteen admins can only send to 'office_only'
        await sendNotification({ title, message, requiresAction: false, target: 'office_only' });
        alert("Tomorrow's menu has been published successfully!");

    } catch (error) {
        console.error("Failed to publish menu", error);
        alert("Could not publish the menu. Please check if the menu is set for tomorrow.");
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-onSurface">Canteen Notifications</h3>
        <div className="bg-slate-50 p-6 rounded-lg border space-y-6">
            <div>
                <h4 className="font-semibold text-slate-800">Publish Tomorrow's Menu</h4>
                <p className="text-sm text-slate-600 mb-3">Sends a notification with tomorrow's menu to all employees scheduled to be in the office.</p>
                <button 
                    onClick={handlePublishMenu} 
                    disabled={isPublishing}
                    className="w-full py-2 flex items-center justify-center bg-secondary text-onPrimary font-semibold rounded-lg hover:bg-orange-600 disabled:bg-slate-400"
                >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    {isPublishing ? 'Publishing...' : "Publish Menu"}
                </button>
            </div>
        </div>
    </div>
  );
};

export default NotificationManager;