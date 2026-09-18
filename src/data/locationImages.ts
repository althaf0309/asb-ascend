import trivandrum640 from '@/assets/locations/trivandrum-640w.webp';
import trivandrum1200 from '@/assets/locations/trivandrum-1200w.webp';
import kazhakootam640 from '@/assets/locations/kazhakootam-technopark-640w.webp';
import kazhakootam1200 from '@/assets/locations/kazhakootam-technopark-1200w.webp';
import kochi640 from '@/assets/locations/kochi-ernakulam-640w.webp';
import kochi1200 from '@/assets/locations/kochi-ernakulam-1200w.webp';
import kozhikode640 from '@/assets/locations/kozhikode-calicut-640w.webp';
import kozhikode1200 from '@/assets/locations/kozhikode-calicut-1200w.webp';
import thrissur640 from '@/assets/locations/thrissur-640w.webp';
import thrissur1200 from '@/assets/locations/thrissur-1200w.webp';
import kollam640 from '@/assets/locations/kollam-640w.webp';
import kollam1200 from '@/assets/locations/kollam-1200w.webp';
import kottayam640 from '@/assets/locations/kottayam-640w.webp';
import kottayam1200 from '@/assets/locations/kottayam-1200w.webp';
import kannur640 from '@/assets/locations/kannur-640w.webp';
import kannur1200 from '@/assets/locations/kannur-1200w.webp';
import alappuzha640 from '@/assets/locations/alappuzha-640w.webp';
import alappuzha1200 from '@/assets/locations/alappuzha-1200w.webp';
import palakkad640 from '@/assets/locations/palakkad-640w.webp';
import palakkad1200 from '@/assets/locations/palakkad-1200w.webp';
import malappuram640 from '@/assets/locations/malappuram-640w.webp';
import malappuram1200 from '@/assets/locations/malappuram-1200w.webp';

const images: Record<string, { small: string; large: string }> = {
  trivandrum: { small: trivandrum640, large: trivandrum1200 },
  'kazhakootam-technopark': { small: kazhakootam640, large: kazhakootam1200 },
  'kochi-ernakulam': { small: kochi640, large: kochi1200 },
  'kozhikode-calicut': { small: kozhikode640, large: kozhikode1200 },
  thrissur: { small: thrissur640, large: thrissur1200 },
  kollam: { small: kollam640, large: kollam1200 },
  kottayam: { small: kottayam640, large: kottayam1200 },
  kannur: { small: kannur640, large: kannur1200 },
  alappuzha: { small: alappuzha640, large: alappuzha1200 },
  palakkad: { small: palakkad640, large: palakkad1200 },
  malappuram: { small: malappuram640, large: malappuram1200 },
};

export const locationImage = (slug: string) => images[slug] || images.trivandrum;
