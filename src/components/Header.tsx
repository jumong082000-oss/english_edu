import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-red-600 p-2 rounded">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-red-600 transition-colors">
              {t('nav.courses')}
            </Link>
            <Link to="/tests" className="text-gray-700 hover:text-red-600 transition-colors">
              {t('nav.tests')}
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-red-600 transition-colors">
                {t('nav.dashboard')}
              </Link>
            )}
            <Link to="/faq" className="text-gray-700 hover:text-red-600 transition-colors">
              {t('nav.faq')}
            </Link>
            <Link to="/support" className="text-gray-700 hover:text-red-600 transition-colors">
              {t('nav.support')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
