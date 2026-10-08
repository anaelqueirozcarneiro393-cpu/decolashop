import AppContainer, { ViewType } from '../page';

export default async function DynamicViewPage({
  params,
}: {
  params: Promise<{ view?: string[] }>;
}) {
  const resolved = await params;
  const viewName = resolved?.view?.[0] as ViewType | undefined;
  return <AppContainer initialView={viewName || 'dashboard'} />;
}
