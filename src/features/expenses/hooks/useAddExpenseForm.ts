import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect } from 'react';
import { useUser } from '@/shared/hooks/useUser';
import { useRouter } from 'expo-router';
import { useCreateExpenseMutation } from './useExpenseMutations';
import type { SplitDetail } from '@/shared/types';

const splitDetailSchema = z.object({
  userId: z.string(),
  owedAmount: z.number(),
});

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter valid amount'),
  paidBy: z.string().min(1, 'Select who paid'),
  groupId: z.string().min(1, 'Select a group'),
  participants: z.array(z.string()).min(1, 'Select at least one participant'),
  splitType: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES']),
  splitDetails: z.array(splitDetailSchema),
  category: z.string().optional(),
  notes: z.string().optional(),
  receiptUri: z.string().optional(),
});

export type AddExpenseFormValues = z.infer<typeof schema>;

export const useAddExpenseForm = (groupId: string) => {
  const { userId } = useUser();
  const router = useRouter();
  const createExpenseMutation = useCreateExpenseMutation();

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      amount: '',
      paidBy: userId,
      groupId: groupId,
      participants: [userId],
      splitType: 'EQUAL',
      splitDetails: [{ userId, owedAmount: 0 }],
      category: 'Other',
    },
  });

  const { control, setValue, handleSubmit } = form;
  const amountStr = useWatch({ control, name: 'amount' });
  const participants = useWatch({ control, name: 'participants' });
  const splitType = useWatch({ control, name: 'splitType' });
  const splitDetails = useWatch({ control, name: 'splitDetails' });

  // Keep form groupId in sync when the prop changes (e.g. groups load async)
  useEffect(() => {
    if (groupId) {
      setValue('groupId', groupId);
    }
  }, [groupId, setValue]);

  const recalculateSplits = useCallback(() => {
    const totalAmount = parseFloat(amountStr) || 0;
    if (totalAmount <= 0 || participants.length === 0) return;

    if (splitType === 'EQUAL') {
      const perPerson = totalAmount / participants.length;
      const details: SplitDetail[] = participants.map((pid) => ({
        userId: pid,
        owedAmount: perPerson,
      }));
      setValue('splitDetails', details);
    }
  }, [amountStr, participants, splitType, setValue]);

  useEffect(() => {
    recalculateSplits();
  }, [recalculateSplits]);

  const updateSplitValues = (details: SplitDetail[]) => {
    setValue('splitDetails', details);
  };

  const submitExpense = async (data: AddExpenseFormValues) => {
    const amount = parseFloat(data.amount);

    await createExpenseMutation.mutateAsync({
      groupId: data.groupId,
      title: data.title,
      amount,
      paidBy: data.paidBy,
      splitType: data.splitType,
      category: data.category,
      participants: data.participants,
      splitDetails: data.splitDetails,
    });

    router.back();
  };

  return {
    form,
    handleSubmit: handleSubmit(submitExpense),
    participants,
    splitType,
    splitDetails,
    setSplitType: (type: AddExpenseFormValues['splitType']) => setValue('splitType', type),
    updateSplitValues,
    isSubmitting: createExpenseMutation.isPending,
  };
};
