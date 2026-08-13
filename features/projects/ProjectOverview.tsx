import { selectedEditorLibrary } from '@/features/editor/editorAdapter';

const mvpItems = ['New Project', 'رفع الصور والشعار والخلفية', 'بيانات الشخص', 'Auto Layout', 'Basic Manual Editing', 'Export PNG/JPG', 'Local Project Saving', 'Template System'];

export function ProjectOverview() {
  return <main className="mx-auto max-w-5xl p-8"><section className="rounded-3xl bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-teal-700">Smart Post Builder</p><h1 className="mt-3 text-4xl font-bold">منشئ منشورات ذكي — هيكل MVP</h1><p className="mt-4 text-slate-600">تم تجهيز المشروع كهيكل Next.js/TypeScript محلي أولًا، مع فصل واضح بين القوالب، المحرر، محرك التخطيط، التخزين، ومعالجة الصور.</p><div className="mt-6 rounded-2xl bg-slate-50 p-4"><strong>Editor:</strong> {selectedEditorLibrary}</div><ul className="mt-6 grid gap-3 sm:grid-cols-2">{mvpItems.map((item) => <li className="rounded-xl border border-slate-200 p-3" key={item}>TODO: {item}</li>)}</ul><a className="mt-6 inline-flex rounded-2xl bg-teal-700 px-5 py-3 font-semibold text-white" href="/projects/new">Create New Project</a></section></main>;
}
