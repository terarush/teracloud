import { HomeView } from '../views/HomeView'
import { Seo } from '@/components/seo'
import { getSeoMeta } from '@/meta'

export default function HomePage() {
  const seo = getSeoMeta()
  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/" ogImage="/company/logo.png" />
      <HomeView />
    </>
  )
}
