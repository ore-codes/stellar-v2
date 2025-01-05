import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ActionButton from '@/chunks/dashboard/ActionButton.tsx';
import CreateMeeting from '@/chunks/dashboard/CreateMeeting/CreateMeeting.tsx';
import AppLogo from '@/components/AppLogo/AppLogo.tsx';
import Button from '@/components/Button/Button.tsx';
import UserCalendar from '@/components/UserCalendar/UserCalendar.tsx';
import { Page } from '@/constants/pages.ts';
import { authService } from '@/lib/auth/AuthService.ts';
import useRxState from '@/lib/storage/useRxState.ts';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const user = useRxState(authService.userStorage.data$);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate(Page.SignIn);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const actions = [
    {
      icon: 'material-symbols:video-call',
      title: 'Create meeting',
      clickHandler: () => setShowCreateModal(true),
    },
    { icon: 'ic:baseline-group', title: 'Join meeting' },
    { icon: 'mdi:calendar-edit', title: 'Schedule meeting' },
    { icon: 'mdi:history', title: 'Meeting history' },
  ];

  return (
    <motion.div
      className="flex min-h-screen flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="border-b-2 px-8 py-4" variants={itemVariants}>
        <AppLogo className="!text-base" />
      </motion.div>
      <div className="flex flex-1 flex-col lg:flex-row">
        <motion.div
          className="max-w-2/5 flex min-w-[15rem] flex-col border-r-2 px-8 py-4"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="flex items-center gap-2 rounded-xl bg-light px-2 py-4"
            variants={itemVariants}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURI(user?.username)}&background=4CAF50&color=fff&size=128`}
              alt="Profile image"
              className="size-10 rounded-full"
            />
            <div>
              <div className="font-bold">{user?.username}</div>
              <div className="text-sm text-placeholder">{user?.email}</div>
            </div>
          </motion.div>
          <motion.div className="mt-6 flex-1" variants={itemVariants}>
            <UserCalendar />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button variant="subtle" size="sm" className="self-start" onClick={handleLogout}>
              <Icon icon="solar:logout-2-outline" className="size-5" />
              Sign out
            </Button>
          </motion.div>
        </motion.div>
        <motion.main
          className="-order-1 grid flex-1 place-items-center lg:order-1"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="grid grid-cols-2 gap-16"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {actions.map((action, index) => (
              <motion.div key={index} variants={itemVariants}>
                <ActionButton
                  icon={action.icon}
                  title={action.title}
                  onClick={action.clickHandler}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.main>
      </div>
      {showCreateModal && (
        <div
          className="fixed left-0 top-0 grid h-screen w-screen place-items-center bg-primary/20"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            variants={itemVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative min-w-96 rounded-xl bg-white p-8 shadow-lg"
          >
            <Icon
              icon="mi:close"
              className="absolute right-8 top-8 size-8"
              onClick={() => setShowCreateModal(false)}
            />
            <CreateMeeting />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
