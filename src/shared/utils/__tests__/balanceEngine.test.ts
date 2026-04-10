import { calculateGroupBalances } from '../balanceEngine';
import { Expense, Settlement } from '@/shared/types';

describe('Balance Engine', () => {
  const users = {
    rahul: 'usr_rahul',
    you: 'usr_you',
    arjun: 'usr_arjun',
  };

  test('Example Case: Dinner and Taxi', () => {
    // Dinner ₹1200, Paid by Rahul, Split 3 ways (400 each)
    const dinner: Expense = {
      id: 'e1',
      groupId: 'g1',
      title: 'Dinner',
      amount: 1200,
      paidBy: users.rahul,
      participants: [users.rahul, users.you, users.arjun],
      splitDetails: [
        { userId: users.rahul, owedAmount: 400 },
        { userId: users.you, owedAmount: 400 },
        { userId: users.arjun, owedAmount: 400 },
      ],
      createdAt: new Date().toISOString(),
      splitType: 'EQUAL',
    };

    // Taxi ₹300, Paid by You, Split Rahul + You (150 each)
    const taxi: Expense = {
      id: 'e2',
      groupId: 'g1',
      title: 'Taxi',
      amount: 300,
      paidBy: users.you,
      participants: [users.rahul, users.you],
      splitDetails: [
        { userId: users.rahul, owedAmount: 150 },
        { userId: users.you, owedAmount: 150 },
      ],
      createdAt: new Date().toISOString(),
      splitType: 'EQUAL',
    };

    const result = calculateGroupBalances([dinner, taxi]);

    /**
     * Expected Result:
     * Dinner: You owe Rahul 400, Arjun owes Rahul 400
     * Taxi: Rahul owes You 150
     * 
     * Net:
     * You -> Rahul: 400 - 150 = 250
     * Arjun -> Rahul: 400
     */
    
    // Rahul paid 1200. He owes 400 himself. Others owe him 800.
    // Taxi: You paid 300. You owe 150 yourself. Rahul owes you 150.
    // Net Position Rahul: +800 (receivable) - 150 (payable) = +650.
    // Net Position You: -400 (payable) + 150 (receivable) = -250.
    // Net Position Arjun: -400 (payable) = -400.
    // 650 - 250 - 400 = 0. Matches.
    
    expect(result.netPositions[users.rahul]).toBe(650);
    expect(result.netPositions[users.you]).toBe(-250);
    expect(result.netPositions[users.arjun]).toBe(-400);

    // Simplified debts
    expect(result.simplifiedDebts).toContainEqual({ from: users.you, to: users.rahul, amount: 250 });
    expect(result.simplifiedDebts).toContainEqual({ from: users.arjun, to: users.rahul, amount: 400 });
  });

  test('Settlement Handling', () => {
    // You owe Rahul 500
    const dinner: Expense = {
      id: 'e1',
      groupId: 'g1',
      title: 'Dinner',
      amount: 1000,
      paidBy: users.rahul,
      participants: [users.rahul, users.you],
      splitDetails: [
        { userId: users.rahul, owedAmount: 500 },
        { userId: users.you, owedAmount: 500 },
      ],
      createdAt: new Date().toISOString(),
      splitType: 'EQUAL',
    };

    // You pay Rahul 300
    const settlement: Settlement = {
      id: 's1',
      groupId: 'g1',
      from: users.you,
      to: users.rahul,
      amount: 300,
      createdAt: new Date().toISOString(),
    };

    const result = calculateGroupBalances([dinner], [settlement]);

    // Net: You owe Rahul 500 - 300 = 200
    expect(result.netPositions[users.rahul]).toBe(200);
    expect(result.netPositions[users.you]).toBe(-200);
    expect(result.simplifiedDebts[0]).toEqual({ from: users.you, to: users.rahul, amount: 200 });
  });

  test('Debt Simplification (A->B, B->C to A->C)', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        title: 'A to B',
        amount: 100,
        paidBy: 'B',
        participants: ['A', 'B'],
        splitDetails: [
          { userId: 'A', owedAmount: 100 },
          { userId: 'B', owedAmount: 0 },
        ],
        createdAt: '',
        splitType: 'EXACT',
      },
      {
        id: 'e2',
        groupId: 'g1',
        title: 'B to C',
        amount: 100,
        paidBy: 'C',
        participants: ['B', 'C'],
        splitDetails: [
          { userId: 'B', owedAmount: 100 },
          { userId: 'C', owedAmount: 0 },
        ],
        createdAt: '',
        splitType: 'EXACT',
      },
    ];

    const result = calculateGroupBalances(expenses);

    // Expected: A owes C 100
    expect(result.simplifiedDebts.length).toBe(1);
    expect(result.simplifiedDebts[0]).toEqual({ from: 'A', to: 'C', amount: 100 });
  });

  test('Rounding safety (0.1 + 0.2)', () => {
     // Scenario where floating point errors usually occur
     const expense: Expense = {
      id: 'e1',
      groupId: 'g1',
      title: 'Rounding Test',
      amount: 0.3,
      paidBy: 'A',
      participants: ['A', 'B', 'C'],
      splitDetails: [
        { userId: 'A', owedAmount: 0.1 },
        { userId: 'B', owedAmount: 0.1 },
        { userId: 'C', owedAmount: 0.1 },
      ],
      createdAt: '',
      splitType: 'EQUAL',
    };

    const result = calculateGroupBalances([expense]);
    expect(result.netPositions['A']).toBe(0.2);
    expect(result.netPositions['B']).toBe(-0.1);
    expect(result.netPositions['C']).toBe(-0.1);
  });
});
