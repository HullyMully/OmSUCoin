import React from "react";
import { Link } from "wouter";
import { School, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <span className="text-primary text-3xl">
                <School className="h-8 w-8" />
              </span>
              <span className="font-display font-bold text-primary text-xl ml-2">OmSU</span>
              <span className="font-display font-bold text-amber-500 text-xl">Coin</span>
            </div>
            <p className="mt-4 text-sm text-neutral-600">
              Блокчейн-платформа для студентов Омского государственного университета.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase">Платформа</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-neutral-600 hover:text-primary">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-sm text-neutral-600 hover:text-primary">
                  Активности
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-neutral-600 hover:text-primary">
                  Рейтинг
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-sm text-neutral-600 hover:text-primary">
                  Награды
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase">Ресурсы</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary flex items-center">
                  Документация
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary flex items-center">
                  Как начать
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary flex items-center">
                  FAQ
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-neutral-600 hover:text-primary flex items-center">
                  О проекте
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 tracking-wider uppercase">Контакты</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-sm text-neutral-600">
                <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                support@omsucoin.ru
              </li>
              <li className="flex items-center text-sm text-neutral-600">
                <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                +7 (3812) 12-34-56
              </li>
              <li className="flex items-center text-sm text-neutral-600">
                <MapPin className="h-4 w-4 text-neutral-400 mr-2" />
                г. Омск, пр. Мира, 55А
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-500">&copy; 2024 OmSUCoin. Все права защищены.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-neutral-400 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
