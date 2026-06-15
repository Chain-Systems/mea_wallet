import { router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

type Route = '/';

interface PrimaryLinkProps {
  href: Route;
  text: string;
  className?: string;
}

const PrimaryLink = ({ href = '/', text, className = '' }: PrimaryLinkProps) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(href)}
      className={`mb-[9px] h-[45px] bg-pink-1100 border border-pink-1100 rounded-[15px] items-center justify-center ${className}`}
    >
      <Text className="text-base font-semibold leading-[22px] text-white">
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryLink;
