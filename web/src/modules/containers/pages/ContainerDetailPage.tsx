import { ContainerDetailView } from '../views/ContainerDetailView'
import { Seo } from '@/components/seo'

interface ContainerDetailPageProps {
  containerId: number;
}

export const ContainerDetailPage = ({ containerId }: ContainerDetailPageProps) => {
  return (
    <>
      <Seo title="Container" path={`/app/containers/${containerId}`} robots="noindex, follow" />
      <ContainerDetailView containerId={containerId} />
    </>
  )
}
