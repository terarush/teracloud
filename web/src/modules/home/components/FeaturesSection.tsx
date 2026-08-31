import React from "react"
import { Activity, CreditCard, HardDrive, Terminal, Zap } from "lucide-react"

const essentials = [
  "Port publik otomatis",
  "Kontrol restart dan stop",
  "Isolasi resource per container",
  "Pembayaran QRIS dan VA",
]

export const FeaturesSection: React.FC = () => {
  return (
    <section id="fitur" className="border-b border-border/70 bg-muted/35 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-primary">CARA KERJA</p>
            <h2 className="max-w-md text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              Infrastruktur yang tidak menghalangi pekerjaanmu.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Pilih resource, tentukan image, lalu deploy. Detail teknis tetap terlihat saat dibutuhkan—tanpa membuat antarmuka terasa penuh.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="sm:col-span-2 grid min-h-72 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 sm:grid-cols-[1.05fr_.95fr]">
              <div className="flex flex-col justify-between p-7 sm:p-9">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Zap className="size-5" /></div>
                <div className="mt-16">
                  <h3 className="text-2xl font-semibold tracking-tight">Dari image ke container dalam hitungan detik.</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Provisioning, jaringan, dan volume dipersiapkan otomatis setelah pembayaran terkonfirmasi.</p>
                </div>
              </div>
              <div className="m-3 flex min-h-56 flex-col justify-center rounded-xl bg-card border border-border p-6 font-mono text-xs text-muted-foreground sm:m-4">
                <p className="text-foreground font-semibold">deployment / terarush-8f31</p>
                <div className="my-5 h-px bg-border" />
                <p><span className="text-primary">01</span> pull image <span className="float-right text-foreground">done</span></p>
                <p className="mt-3"><span className="text-primary">02</span> mount volume <span className="float-right text-foreground">done</span></p>
                <p className="mt-3"><span className="text-primary">03</span> expose port <span className="float-right text-foreground">done</span></p>
                <p className="mt-3"><span className="text-primary">04</span> health check <span className="float-right text-primary">healthy</span></p>
              </div>
            </article>

            <article className="flex min-h-80 flex-col justify-between rounded-2xl bg-card p-7 ring-1 ring-foreground/10 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><HardDrive className="size-5" /></div>
                <span className="font-mono text-[10px] text-muted-foreground">NVMe volume</span>
              </div>
              <div>
                <Activity className="mb-5 size-16 stroke-[0.8] text-foreground/20" />
                <h3 className="text-xl font-semibold tracking-tight">Data tetap tinggal.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Restart dan redeploy tanpa kehilangan konfigurasi atau file aplikasi.</p>
              </div>
            </article>

            <article className="flex min-h-80 flex-col justify-between rounded-2xl bg-card p-7 border border-border ring-1 ring-foreground/5 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Terminal className="size-5" /></div>
                <span className="font-mono text-[10px] text-muted-foreground">root@container</span>
              </div>
              <div>
                <p className="mb-5 font-mono text-xs leading-6 text-muted-foreground">$ ssh root@node<br />Last login: today<br /><span className="inline-block h-3 w-1.5 bg-primary align-middle" /></p>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">Terminal saat kamu membutuhkannya.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Gunakan browser atau SSH client favoritmu dengan akses root penuh.</p>
              </div>
            </article>

            <article className="sm:col-span-2 grid gap-8 rounded-2xl bg-card p-7 ring-1 ring-foreground/10 sm:grid-cols-2 sm:p-9">
              <div>
                <CreditCard className="size-6 text-primary" />
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">Satu harga, detail yang jelas.</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Resource dan masa aktif terlihat sebelum checkout. Tidak ada konfigurasi tersembunyi.</p>
              </div>
              <ul className="grid content-center gap-0 divide-y divide-border border-y border-border">
                {essentials.map((item) => (
                  <li key={item} className="flex items-center justify-between py-3.5 text-sm font-medium">
                    {item}<span className="text-primary">✓</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
