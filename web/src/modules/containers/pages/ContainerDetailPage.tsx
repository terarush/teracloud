import { ContainerDetailView } from '../views/ContainerDetailView'

interface ContainerDetailPageProps {
  containerId: number;
}

export const ContainerDetailPage = ({ containerId }: ContainerDetailPageProps) => {
  return <ContainerDetailView containerId={containerId} />
}
