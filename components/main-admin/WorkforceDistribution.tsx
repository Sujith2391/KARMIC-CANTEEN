import React, { useState, useEffect } from 'react';
import { getDailyWorkforceDistribution } from '../../services/api';
import { WorkforceDistribution as WorkforceDistributionData, WorkLocation } from '../../types';
import { OfficeIcon, HomeIcon, LeaveIcon, GlobeIcon, UsersIcon } from '../icons';

const StatCard: React.FC<{ title: string; count: number; icon: React.ReactNode; color: string }> = ({ title, count, icon, color }) => (
    <div className="bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-onSurface">{count}</p>
        </div>
    </div>
);

const WorkforceDistribution: React.FC = () => {
    const [distribution, setDistribution] = useState<WorkforceDistributionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistribution = async () => {
            setLoading(true);
            try {
                const data = await getDailyWorkforceDistribution();
                setDistribution(data);
            } catch (error) {
                console.error("Failed to fetch workforce distribution", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDistribution();
    }, []);

    if (loading) {
        return (
            <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg text-center">
                <p>Loading today's workforce stats...</p>
            </div>
        );
    }
    
    if (!distribution) {
        return null;
    }

    return (
        <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-onSurface mb-4">Today's Workforce Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard 
                    title="Total Employees"
                    count={distribution.total}
                    icon={<UsersIcon className="w-6 h-6 text-purple-800" />}
                    color="bg-purple-100"
                />
                <StatCard 
                    title="In Office"
                    count={distribution[WorkLocation.MAIN_OFFICE]}
                    icon={<OfficeIcon className="w-6 h-6 text-blue-800" />}
                    color="bg-blue-100"
                />
                <StatCard 
                    title="Work From Home"
                    count={distribution[WorkLocation.WFH]}
                    icon={<HomeIcon className="w-6 h-6 text-green-800" />}
                    color="bg-green-100"
                />
                 <StatCard 
                    title="On Leave"
                    count={distribution[WorkLocation.ON_LEAVE]}
                    icon={<LeaveIcon className="w-6 h-6 text-yellow-800" />}
                    color="bg-yellow-100"
                />
                <StatCard 
                    title="Other Location"
                    count={distribution[WorkLocation.OTHER]}
                    icon={<GlobeIcon className="w-6 h-6 text-slate-800" />}
                    color="bg-slate-200"
                />
            </div>
        </div>
    );
};

export default WorkforceDistribution;