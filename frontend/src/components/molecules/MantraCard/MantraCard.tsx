import React, { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectBudgets, selectAllTransactions } from '../../../store';
import Heading from '../../atoms/Headings/Heading';
import Icon from '../../atoms/Icons/Icon';
import styles from './MantraCard.module.css';

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  spent: number;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
}

const MantraCard = memo(() => {
  const budgets = useSelector(selectBudgets) as Budget[];
  const transactions = useSelector(selectAllTransactions) as Transaction[];
  const [mantra, setMantra] = useState<{ text: string; emoji: string; type: string } | null>(null);

  const generateMantra = (): { text: string; emoji: string; type: string } => {
    // Check if user has made any transactions
    if (transactions.length === 0) {
      const mantras = [
        { text: "Every financial journey begins with a single transaction. Ready to start yours?", emoji: "🚀", type: "motivation" },
        { text: "The best time to start tracking expenses was yesterday. The second best time is now!", emoji: "⏰", type: "motivation" },
        { text: "Your future self will thank you for every penny tracked today.", emoji: "🎯", type: "motivation" },
        { text: "A budget without transactions is like a map without a journey. Let's get moving!", emoji: "🗺️", type: "motivation" },
        { text: "Financial freedom starts with the first step. Take it today!", emoji: "🎉", type: "motivation" },
        { text: "Pro tip: Money that's tracked tends to behave better than money that's ignored.", emoji: "👑", type: "motivation" }
      ];
      return mantras[Math.floor(Math.random() * mantras.length)];
    }

    // Check budget status
    const budgetsWithNoMoneyLeft = budgets.filter(budget => (budget.spent || 0) >= budget.limit);
    const budgetsWithMoneyLeft = budgets.filter(budget => (budget.spent || 0) < budget.limit);

    // User has no money left in any budgets
    if (budgets.length > 0 && budgetsWithNoMoneyLeft.length === budgets.length) {
      const mantras = [
        { text: "Budget limits reached across the board! Time for some creative financial wizardry.", emoji: "🎭", type: "warning" },
        { text: "You've officially maxed out all budgets. Consider it a full exploration of your spending potential!", emoji: "🌟", type: "warning" },
        { text: "All budgets exhausted! Your money went on quite the adventure this month.", emoji: "🏔️", type: "warning" },
        { text: "Budget completion rate: 100%. Time to channel your inner financial ninja for the rest of the month!", emoji: "🥷", type: "warning" },
        { text: "All budgets have crossed the finish line. Ready for some next-level budgeting strategies?", emoji: "🏁", type: "warning" },
        { text: "Achievement unlocked: Master Budget Spender! Now let's work on the Master Budget Saver badge.", emoji: "🏆", type: "warning" }
      ];
      return mantras[Math.floor(Math.random() * mantras.length)];
    }

    // User has no money left in 3 or more budgets
    if (budgetsWithNoMoneyLeft.length >= 3) {
      const mantras = [
        { text: `${budgetsWithNoMoneyLeft.length} budgets have reached their peak! Time to give the others some breathing room.`, emoji: "⛰️", type: "caution" },
        { text: "Multiple budgets are sending SOS signals! Deploy the emergency spending freeze protocol.", emoji: "🆘", type: "caution" },
        { text: `${budgetsWithNoMoneyLeft.length} budgets have officially tapped out. The remaining ones are looking nervous.`, emoji: "😅", type: "caution" },
        { text: "Several budgets have crossed the finish line early. Let's pace the remaining ones to the month-end!", emoji: "🏃‍♂️", type: "caution" },
        { text: "Multiple budget categories are waving white flags. Time for strategic spending maneuvers!", emoji: "🏳️", type: "caution" },
        { text: "Your budgets are staging a mini-revolt! Time to negotiate some peace treaties.", emoji: "🕊️", type: "caution" }
      ];
      return mantras[Math.floor(Math.random() * mantras.length)];
    }

    // User has money left in all budgets
    if (budgets.length > 0 && budgetsWithMoneyLeft.length === budgets.length) {
      const mantras = [
        { text: "All budgets are in the green zone! You're basically a financial superhero right now.", emoji: "🦸‍♂️", type: "success" },
        { text: "Every budget is smiling today! Your future self is probably doing a happy dance.", emoji: "💃", type: "success" },
        { text: "Budget status: All systems go! Houston, we have financial liftoff.", emoji: "🚀", type: "success" },
        { text: "All budgets are looking healthy and happy. You've got this money management thing down!", emoji: "😊", type: "success" },
        { text: "Every category is under budget. You're basically the Marie Kondo of personal finance!", emoji: "✨", type: "success" },
        { text: "All budgets reporting for duty with money to spare! Financial discipline level: Expert.", emoji: "🎖️", type: "success" }
      ];
      return mantras[Math.floor(Math.random() * mantras.length)];
    }

    // Default case - mixed budget status
    const mantras = [
      { text: "Some budgets are thriving, others need TLC. Balance is the key to financial zen!", emoji: "⚖️", type: "neutral" },
      { text: "Your budgets are like a mixed playlist - some hits, some misses, but all part of the journey!", emoji: "🎵", type: "neutral" },
      { text: "Half full, half empty - your budgets are teaching you the art of perspective!", emoji: "🥛", type: "neutral" },
      { text: "Budget diversity in action! Some categories are crushing it, others learning to pace themselves.", emoji: "🌈", type: "neutral" },
      { text: "Your spending patterns are as unique as your fingerprint. Embrace the beautiful chaos!", emoji: "🔍", type: "neutral" },
      { text: "Financial life is like a rollercoaster - some ups, some downs, but always an adventure!", emoji: "🎢", type: "neutral" }
    ];
    return mantras[Math.floor(Math.random() * mantras.length)];
  };

  useEffect(() => {
    setMantra(generateMantra());
  }, [budgets, transactions]);

  if (!mantra) {
    return (
      <div className={styles.mantraCard} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #1e3a8a', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(30, 41, 59, 0.1)' }}>
        <div className={styles.mantraCardHeader}>
          <Heading level={3} className={styles.mantraCardTitle}>Your Financial Mantra</Heading>
        </div>
        <div className={styles.mantraCardContent}>
          <span className={styles.mantraCardEmoji}>💭</span>
          <p className={styles.mantraCardText}>Loading your daily inspiration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mantraCard} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: '4px solid #1e3a8a', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(30, 41, 59, 0.1)' }}>
      <div className={styles.mantraCardHeader}>
        <Heading level={3} className={styles.mantraCardTitle}>Your Financial Mantra</Heading>
      </div>
      <div className={styles.mantraCardContent}>
        <span className={styles.mantraCardEmoji}>{mantra.emoji}</span>
        <p className={styles.mantraCardText}>{mantra.text}</p>
      </div>
    </div>
  );
});

MantraCard.displayName = 'MantraCard';

export default MantraCard;
