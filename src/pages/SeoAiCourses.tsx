import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle, MapPin, Workflow } from 'lucide-react';
import pages from '@/data/seoAiPages.json';
import InquiryForm from '@/components/InquiryForm';
import { absoluteUrl, removeJsonLd, setJsonLd, setPageSeo } from '@/lib/seo';

type Family = 'agentic' | 'generative';
type Page = { family: Family; slug: string; title: string; question: boolean };
const all = pages as Page[];
const labels = { agentic: 'Agentic AI', generative: 'Generative AI' };
const locations = ['Thiruvananthapuram','Trivandrum','Kazhakootam','Kazhakkottam','Technopark','Kollam','Pathanamthitta','Alappuzha','Alleppey','Kottayam','Idukki','Kochi','Ernakulam','Kakkanad','Thrissur','Palakkad','Malappuram','Kozhikode','Calicut','Wayanad','Kannur','Kasaragod','Kerala'];

export default function SeoAiCourses(){
  const { family, slug } = useParams();
  const valid = family === 'agentic' || family === 'generative';
  const list = valid ? all.filter(p => p.family === family) : [];
  const page = slug ? list.find(p => p.slug === slug) : undefined;
  const label = valid ? labels[family as Family] : 'AI';
  const base = `/course-training/${family}/ai`;
  const place = page ? locations.find(x => page.title.toLowerCase().includes(x.toLowerCase())) : undefined;
  const description = page ? `${page.title}: practical ${label} learning with guided projects, certification support and flexible course guidance from ASB Training Hub${place ? ` for learners in ${place}` : ''}.` : `Explore ${label} course, training, certification, career and location pages from ASB Training Hub.`;
  useEffect(()=>{
    if(!valid || (slug && !page)){ setPageSeo({title:'AI Course Page Not Found',description:'Browse practical AI courses.',keywords:'AI courses Kerala',path:'/ai-courses',noindex:true}); return; }
    const path=page?`${base}/${page.slug}`:base;
    const title=page?page.title:`${label} Course and Training Pages`;
    setPageSeo({title:`${title} | ASB Training Hub`,description,keywords:page?`${page.title}, ${label} course Kerala, practical AI training`:`${label} course Kerala, ${label} training`,path,image:`/images/${family}-ai-course-hero.webp`});
    setJsonLd('seo-ai-course',page?[{'@context':'https://schema.org','@type':page.question?'FAQPage':'Course',...(page.question?{mainEntity:[{'@type':'Question',name:page.title,acceptedAnswer:{'@type':'Answer',text:description}}]}:{name:page.title,description,url:absoluteUrl(path),provider:{'@type':'EducationalOrganization',name:'ASB Training Hub'},hasCourseInstance:[{'@type':'CourseInstance',courseMode:'blended'}]})},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[['Home','/'],[`${label} pages`,base],[page.title,path]].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item:absoluteUrl(item)}))}]:{'@context':'https://schema.org','@type':'ItemList',name:title,numberOfItems:list.length,itemListElement:list.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.title,url:absoluteUrl(`${base}/${p.slug}`)}))});
    return()=>removeJsonLd('seo-ai-course');
  },[family,slug,page,valid]);
  if(!valid || (slug&&!page)) return <main className="min-h-[60vh] pt-32 text-center"><h1>Page not found</h1><Link to="/ai-courses">Browse AI courses</Link></main>;
  const hero=`/images/${family}-ai-course-hero.webp`;
  if(!page) return <main><section className="relative pt-32 pb-24 text-white"><img src={hero} alt={`${label} professional training`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-black/70"/><div className="container relative mx-auto px-4"><h1 className="text-4xl md:text-6xl font-bold">{label} Course and Training Guide</h1><p className="mt-5 max-w-3xl text-lg text-gray-200">Browse {list.length} focused course, location, career and FAQ pages.</p></div></section><section className="section-padding"><div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">{list.map(p=><Link key={p.slug} to={`${base}/${p.slug}`} className="rounded-xl border p-5 hover-lift"><span className="text-xs font-semibold text-primary">{p.question?'Course FAQ':'Course pathway'}</span><h2 className="font-bold mt-2">{p.title}</h2></Link>)}</div></section></main>;
  const related=list.filter(p=>p.slug!==page.slug&&(place?p.title.includes(place):true)).slice(0,6);
  return <main><section className="relative min-h-[570px] pt-28 flex items-center text-white"><img src={hero} alt={`${page.title} practical learning`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-black/72"/><div className="container relative mx-auto px-4 py-12 grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center"><div><span className="text-orange-300 font-semibold">{place?<><MapPin className="inline h-4 w-4"/> {place}</>:'Career-focused AI learning'}</span><h1 className="text-4xl md:text-6xl font-bold mt-4">{page.title}</h1><p className="text-lg text-gray-200 mt-5">{description}</p></div><div className="rounded-2xl bg-background text-foreground p-6"><h2 className="text-2xl font-bold">Request course details</h2><p className="text-sm text-muted-foreground my-3">Ask about syllabus, fees, prerequisites and upcoming batches.</p><InquiryForm stacked preselectedCourse="ai"/></div></div></section><section className="section-padding"><div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10"><article><h2 className="text-3xl font-bold">{page.question?'Clear course guidance':'Practical course overview'}</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description} The learning path connects essential concepts with supervised exercises, responsible implementation and portfolio-ready outcomes.</p><h2 className="text-2xl font-bold mt-9">Skills covered</h2><ul className="mt-5 space-y-3">{(family==='agentic'?['AI agent architecture and orchestration','Tool use, memory and workflow design','Evaluation, safety and human oversight','Deploying a practical autonomous-agent project']:['Prompt design and model fundamentals','Text, image and multimodal workflows','Retrieval, evaluation and responsible AI','Building a practical generative AI project']).map(x=><li className="flex gap-2" key={x}><CheckCircle className="h-5 w-5 text-primary shrink-0"/>{x}</li>)}</ul></article><aside className="rounded-2xl bg-muted/40 p-7"><h2 className="text-2xl font-bold flex gap-2"><Workflow className="text-primary"/>Learning format</h2><p className="mt-4 text-muted-foreground">Instructor-led explanations, guided labs, project reviews and career-focused feedback. Online and classroom availability depends on the current batch schedule.</p><h2 className="text-xl font-bold mt-8 flex gap-2"><BookOpen className="text-primary"/>Related searches</h2><div className="mt-4 space-y-3">{related.map(p=><Link key={p.slug} to={`${base}/${p.slug}`} className="flex gap-2 border-b pb-3 hover:text-primary">{p.title}<ArrowRight className="h-4 w-4 shrink-0"/></Link>)}</div></aside></div></section></main>;
}
