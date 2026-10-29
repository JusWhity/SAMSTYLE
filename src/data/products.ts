import { Product } from '../types';

const blackHoodieImg = '/src/assets/images/hoodie_black_clean_1793244839219.jpg';
const creamHoodieImg = '/src/assets/images/hoodie_cream_clean_1793244853864.jpg';
const charcoalHoodieImg = '/src/assets/images/hoodie_charcoal_clean_1793244867317.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'sam-01-black-hoodie',
    name: 'هودی مشکی بیسیک',
    category: 'hoodies',
    priceToman: 1850000,
    colors: [
      {
        name: 'مشکی',
        hex: '#111111',
        image: blackHoodieImg,
      },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'هودی مینیمال پنبه‌ای با قواره آزاد و دوخت تمیز.',
  },
  {
    id: 'sam-02-cream-hoodie',
    name: 'هودی کرم استخوانی',
    category: 'hoodies',
    priceToman: 1850000,
    colors: [
      {
        name: 'کرم استخوانی',
        hex: '#EBE7DD',
        image: creamHoodieImg,
      },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'هودی پارچه فلیس نرم با رنگ استخوانی و تن‌خور استاندارد.',
  },
  {
    id: 'sam-03-charcoal-hoodie',
    name: 'هودی زغالی اسیدواش',
    category: 'hoodies',
    priceToman: 1950000,
    colors: [
      {
        name: 'زغالی',
        hex: '#2e2e2e',
        image: charcoalHoodieImg,
      },
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'هودی شستشوی سنگشور وینتیج با آستین آزاد.',
  },
  {
    id: 'sam-04-heavy-hoodie',
    name: 'هودی هوی‌ویت ۴۵۰ گرم',
    category: 'hoodies',
    priceToman: 2250000,
    colors: [
      {
        name: 'مشکی خالص',
        hex: '#0a0a0a',
        image: blackHoodieImg,
      },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'هودی سنگین ۴۵۰ گرم دورس سه نخ تو کرکی.',
  },
  {
    id: 'sam-05-boxy-cream',
    name: 'هودی باکسی استخوانی',
    category: 'hoodies',
    priceToman: 1950000,
    colors: [
      {
        name: 'استخوانی',
        hex: '#EBE7DD',
        image: creamHoodieImg,
      },
    ],
    sizes: ['M', 'L', 'XL'],
    description: 'هودی کات باکسی بدون بند کلاه و مینیمال.',
  },
  {
    id: 'sam-06-vintage-charcoal',
    name: 'هودی وینتیج واش',
    category: 'hoodies',
    priceToman: 2150000,
    colors: [
      {
        name: 'دودی مات',
        hex: '#333333',
        image: charcoalHoodieImg,
      },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'هودی وینتیج با پارچه پریمیوم و افکت فرسوده ملایم.',
  },
];
