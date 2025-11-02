import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is IELTS?',
      answer: 'IELTS (International English Language Testing System) is a standardized test to measure English language proficiency for non-native English speakers.',
    },
    {
      question: 'How is IELTS scored?',
      answer: 'IELTS uses a band score system ranging from 0 to 9, with 9 being expert user and 0 being non-user. Each section (Reading, Writing, Listening, Speaking) receives a band score, and an overall band score is calculated.',
    },
    {
      question: 'How do I prepare for IELTS?',
      answer: 'Effective IELTS preparation includes regular practice with authentic materials, understanding the test format, working on all four skills (Reading, Writing, Listening, Speaking), and taking practice tests.',
    },
    {
      question: 'How long does it take to prepare for IELTS?',
      answer: 'Preparation time varies depending on your current English level and target score. Most students need 2-3 months of dedicated study, but this can range from 1 month to 6 months or more.',
    },
    {
      question: 'Can I retake the IELTS test?',
      answer: 'Yes, you can take the IELTS test as many times as you want. There is no limit on the number of attempts.',
    },
    {
      question: 'How long are IELTS results valid?',
      answer: 'IELTS test results are valid for two years from the test date.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('faq.title')}</h1>
          <p className="text-xl text-gray-600">{t('faq.subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-red-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            {t('support.subtitle')}
          </p>
          <a
            href="/support"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('nav.support')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
