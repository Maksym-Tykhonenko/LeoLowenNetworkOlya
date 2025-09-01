import type { ImageSourcePropType } from 'react-native';

export type ArticleId = 'renovation' | 'hairdresser' | 'shoe' | 'manicure' | 'photographer';

export type Article = {
  id: ArticleId;
  title: string;
  hero: ImageSourcePropType;
  body: string[];
};

export const ARTICLES: Record<ArticleId, Article> = {
  renovation: {
    id: 'renovation',
    title: 'How to choose a contractor for flat renovation',
    hero: require('../../assets/renovation.png'),
    body: [
      'Choosing a contractor for your flat renovation is no easy task. To avoid unpleasant surprises and achieve quality results, follow a few simple recommendations.',
      '1. Define your needs. Before searching for a contractor, clearly outline what work you require: cosmetic repairs, reconfiguration, or a complete renovation. This will help you find a specialist with the right qualifications.',
      '2. Seek recommendations. Ask friends and acquaintances who have done renovations. Personal recommendations are often more reliable than online reviews.',
      '3. Check the portfolio. A good contractor always has examples of completed work. Review their portfolio to assess their style and quality of execution.',
      '4. Discuss the estimate. Before starting any work, be sure to create an estimate that lists all materials and services. This will help avoid misunderstandings during the renovation process.',
      '5. Sign a contract. Don’t forget the legal side of things. Signing a contract will protect you from potential risks and misunderstandings.',
      'By following these tips, you can choose a reliable contractor and achieve the renovation of your dreams.',
    ],
  },

  hairdresser: {
    id: 'hairdresser',
    title: 'How to find a good hairdresser',
    hero: require('../../assets/hairdresser.png'),
    body: [
      'Finding a good hairdresser is an important step in maintaining your image. Here are some tips to help you choose a specialist.',
      '1. Look for reviews. Start by searching for information about hairdressers in your area. Read reviews on specialised websites and social media.',
      '2. Check their work. Hairdressers often showcase their work on Instagram or other platforms. This is a great way to assess their style and skills.',
      '3. Book a consultation. Before scheduling a haircut or colour, it’s worth having a short consultation. This will help you understand how well the hairdresser understands your needs.',
      '4. Pay attention to the salon atmosphere. A comfortable environment and friendly staff are important factors for a successful visit.',
      '5. Don’t be afraid to experiment. If you’re unsure about your choice, try a few different stylists until you find your perfect hairdresser.',
      'By following these recommendations, you can find a specialist who will make your hairstyle perfect.',
    ],
  },

  shoe: {
    id: 'shoe',
    title: 'How to choose a shoe repair specialist',
    hero: require('../../assets/shoe.png'),
    body: [
      'Shoe repair is a service that can significantly extend the life of your favourite pairs. To choose a good craftsman, pay attention to the following aspects:',
      '1. Research local workshops. You can find information about nearby workshops online or by asking acquaintances. A good reputation is the key to quality repairs.',
      '2. Check the craftsman\'s qualifications. Find out how many years the craftsman has been working in this field and what services they offer. An experienced specialist will be able to handle even complex tasks.',
      '3. Discuss the cost of services. Before starting the repair, be sure to clarify the price for the services and the time frame for completion.',
      '4. Look at the materials. A good craftsman uses quality materials for shoe repairs. Pay attention to what materials they offer.',
      '5. Evaluate the result. If you are satisfied with the work done, don’t forget to leave a review and recommend the craftsman to others.',
      'By following these tips, you will be able to find a reliable shoe repair craftsman and extend the life of your favourite pairs.',
    ],
  },

  manicure: {
    id: 'manicure',
    title: 'How to choose a manicure specialist',
    hero: require('../../assets/manicure.png'),
    body: [
      'A quality manicure is an important aspect of self-care, so choosing the right specialist matters. Here are some tips for selecting a manicure master:',
      '1. Look for reviews and recommendations. Ask friends to recommend a trusted master or read reviews online.',
      '2. Pay attention to cleanliness and order in the salon. The cleanliness of tools and the workspace is essential for your health and safety.',
      '3. Ask to see a portfolio. A good master is always happy to showcase their work so you can assess their style and quality.',
      '4. Inquire about the materials used. Choose a master who uses high-quality and safe materials for the manicure.',
      '5. Don’t hesitate to ask questions. Clarify all details of the procedure to ensure you are confident in your choice.',
      'By following these recommendations, you can find an experienced specialist and enjoy beautiful hands.',
    ],
  },

  photographer: {
    id: 'photographer',
    title: 'A photographer for any goals',
    hero: require('../../assets/photographer.png'),
    body: [
      'Choosing a photographer for an important event — whether it\'s a wedding, anniversary, or corporate gathering — is a significant task. Here are some tips to help you make the right choice:',
      '1. Determine the shooting style. Every photographer has their own style — from classic to artistic or documentary. Decide which style resonates with you.',
      '2. Review portfolios. Look through the work of various photographers to assess the quality of their shots and their approach to work.',
      '3. Read reviews. Client feedback can provide insight into the photographer\'s professionalism and ability to work with people.',
      '4. Discuss the details. Before signing a contract, discuss all the nuances: the number of hours of shooting, the number of edited photos, and payment terms.',
      '5. Sign a contract. This will protect your interests and help avoid misunderstandings in the future.',
      'By following these tips, you can choose a photographer who will capture the important moments of your life at a high level.',
    ],
  },
};

export function findArticleIdByTitleOrCategory(title?: string, category?: string): ArticleId | undefined {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (t.includes('renovation') || c.includes('renovation')) return 'renovation';
  if (t.includes('hair') || c.includes('hair')) return 'hairdresser';
  if (t.includes('shoe') || c.includes('cobbler') || c.includes('repair')) return 'shoe';
  if (t.includes('manicur') || c.includes('nail')) return 'manicure';
  if (t.includes('photo') || c.includes('photo')) return 'photographer';
  return undefined;
}