import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import ScreenHeader from '../../../components/ScreenHeader';

const faqs = [
  { 
    id: '1', 
    title: 'How to use a wallet', 
    subtitle: 'How to send tokens to the other party',
    content: `Seeing other children draw their fingers when they draw their hands in a circle, Ko's mother expected her daughter to go to medical school. But her talent lies in drawing anatomical observations well. Ko started art entrance when she was a seventh grader and graduated from an art high school to enter an art college. When she went to college, she found that there were so many people who were good at drawing. \n\n\n Seeing other children draw their fingers when they draw their hands in a circle, Ko's mother expected her daughter to go to medical school. `,
    lastUpdated: '7 days ago'
  },
  { 
    id: '2', 
    title: 'How to recover my seed phrase', 
    subtitle: 'Guide to wallet recovery',
    content: 'Step by step recovery process...',
    lastUpdated: '3 days ago'
  },
  { 
    id: '3', 
    title: 'How to swap tokens', 
    subtitle: 'Exchanging tokens within the app',
    content: 'Complete token swap tutorial...',
    lastUpdated: '1 day ago'
  },
];

export default function FAQDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);


  const faq = faqs.find(f => f.id === id);

  if (!faq) {
    return (
      <View className="bg-black-1000 flex-1 items-center justify-center">
        <Text className="text-white">{t("faq.not_found")}</Text>
      </View>
    );
  }


  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      className="bg-black-1000"
    >
      <View className="w-full h-full max-w-5xl mx-auto px-4 pt-8 pb-10">
        <View className="w-full">
          <ScreenHeader title={t("faq.title")} />

          <View className="mt-10">
            <Text className='text-[21px] font-semibold text-white'>{faq.id}. {faq.title}</Text>
            <Text className='text-sm text-gray-1200 font-medium my-10'>{faq.lastUpdated} | {t("faq.update_time")}</Text>
            <Text className='text-[17px] font-semibold text-white'>{faq.content}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}