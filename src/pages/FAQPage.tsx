import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Kamp alanı rezervasyonu nasıl yapılır?',
    answer: 'Kamp alanı detay sayfasından giriş ve çıkış tarihlerinizi seçip rezervasyon yapabilirsiniz.',
  },
  {
    question: 'Ürünler nasıl teslim edilir?',
    answer: 'Ürünler kargoyla adresinize teslim edilir veya şubemizden alabilirsiniz. Detaylı bilgi için iletişime geçin.',
  },
  {
    question: 'İade ve değişim nasıl yapılır?',
    answer: 'Ürünler hasar görmeden ve kutusunda 14 gün içinde iade edilebilir. Değişim ve iade için iletişime geçin.',
  },
  {
    question: 'Rezervasyon iptali yapabilir miyim?',
    answer: 'Evet, rezervasyon tarihinden en az 48 saat önce iptal ederseniz ücret iadesi yapılır.',
  },
  {
    question: 'Kamp alanlarında hangi olanaklar var?',
    answer: 'Kamp alanlarımızda su, elektrik, tuvalet, duş ve bazı alanlarda Wi-Fi bulunmaktadır. Detaylar için kamp alanı sayfasını inceleyebilirsiniz.',
  },
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SEO title="Sık Sorulan Sorular" description="Sık sorulan sorular ve cevapları" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sık Sorulan Sorular
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <span className="text-2xl text-gray-500">
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

