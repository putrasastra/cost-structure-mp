import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '../../lib/utils';
import { PpnRecording } from '../../components/tax/PpnRecording';
import { PphRecording } from '../../components/tax/PphRecording';
import { PersonalRecording } from '../../components/tax/PersonalRecording';

export function TaxRecording() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs = [
    { name: 'PPN (Pajak Pertambahan Nilai)', component: <PpnRecording /> },
    { name: 'PPh Badan', component: <PphRecording /> },
    { name: 'PPh Pribadi', component: <PersonalRecording /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Pencatatan Pajak</h2>
      
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex space-x-1 rounded-xl bg-slate-200 p-1 max-w-md">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                cn(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-primary shadow'
                    : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-800'
                )
              }
            >
              {tab.name.split(' ')[0]}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={cn(
                'rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
