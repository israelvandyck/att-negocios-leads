export interface ATTPackage {
  id: string;
  name: string;
  price: number;
  data: string;
  socialApps: number;
  videoApps?: number;
  features: string[];
}

export const ATT_PACKAGES: ATTPackage[] = [
  {
    id: 'p299',
    name: 'Ármalo 299',
    price: 299,
    data: '9 GB',
    socialApps: 4,
    features: ['Minutos y SMS Ilimitados', '4 Redes Sociales Ilimitadas', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p399',
    name: 'Ármalo 399',
    price: 399,
    data: '12 GB',
    socialApps: 5,
    features: ['Minutos y SMS Ilimitados', '5 Redes Sociales Ilimitadas', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p499',
    name: 'Ármalo 499',
    price: 499,
    data: '16 GB',
    socialApps: 5,
    videoApps: 3,
    features: ['Minutos y SMS Ilimitados', '5 Redes Sociales + 3 Video Conf.', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p599',
    name: 'Ármalo 599',
    price: 599,
    data: '25 GB',
    socialApps: 6,
    videoApps: 3,
    features: ['Minutos y SMS Ilimitados', '6 Redes Sociales + 3 Video Conf.', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p799',
    name: 'Ármalo 799',
    price: 799,
    data: '40 GB',
    socialApps: 7,
    videoApps: 3,
    features: ['Minutos y SMS Ilimitados', '7 Redes Sociales + 3 Video Conf.', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p1299',
    name: 'Ármalo 1299',
    price: 1299,
    data: '58 GB',
    socialApps: 8,
    videoApps: 3,
    features: ['Minutos y SMS Ilimitados', '8 Redes Sociales + 3 Video Conf.', 'AT&T FlexControl Incluido', 'AT&T 5G']
  },
  {
    id: 'p1499',
    name: 'Ármalo 1499',
    price: 1499,
    data: '63 GB',
    socialApps: 8,
    videoApps: 3,
    features: ['Minutos y SMS Ilimitados', '8 Redes Sociales + 3 Video Conf.', 'AT&T FlexControl Incluido', 'AT&T 5G']
  }
];
