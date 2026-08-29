export interface FeatureItem {
  title: string
  description: string
  icon: string
}

export interface FAQItem {
  question: string
  answer: string
}

export const homeFeatures: FeatureItem[] = [
  {
    title: "Instant Provisioning",
    description: "Container Docker Anda siap digunakan dalam hitungan detik setelah pembayaran dikonfirmasi.",
    icon: "Zap",
  },
  {
    title: "Persistent NVMe Storage",
    description: "Semua data konfigurasi, aplikasi, dan file Anda tersimpan permanen di storage NVMe berkecepatan tinggi.",
    icon: "HardDrive",
  },
  {
    title: "Web Terminal & SSH Access",
    description: "Akses shell langsung dari browser menggunakan xterm.js interaktif atau melalui SSH client favorit Anda.",
    icon: "Terminal",
  },
  {
    title: "Realtime Resource Monitoring",
    description: "Pantau penggunaan CPU, RAM, Network I/O, dan Disk secara realtime melalui grafik interaktif.",
    icon: "Activity",
  },
  {
    title: "Full Root & Port Control",
    description: "Dapatkan akses root penuh dengan port publik otomatis untuk SSH dan Web application Anda.",
    icon: "ShieldCheck",
  },
  {
    title: "Otomatisasi Pembayaran",
    description: "Mendukung pembayaran mudah via QRIS, Virtual Account bank nasional, dan e-wallet melalui Midtrans.",
    icon: "CreditCard",
  },
]

export const homeFAQs: FAQItem[] = [
  {
    question: "Apa itu Teracloud Docker Hosting?",
    answer: "Teracloud adalah platform hosting cloud berbasis container Docker terisolasi yang memberikan kebebasan bagi developer untuk menjalankan berbagai aplikasi, bot, database, atau web server dengan performa tinggi dan harga terjangkau.",
  },
  {
    question: "Bagaimana cara mengakses container saya?",
    answer: "Setelah pembelian berhasil, container langsung aktif. Anda dapat mengakses terminal langsung di browser melalui Web Terminal atau menggunakan port SSH yang diberikan pada dashboard.",
  },
  {
    question: "Apakah data saya aman jika container di-restart?",
    answer: "Ya, direktori penyimpanan Anda terikat ke persistent volume khusus, sehingga data Anda tidak akan hilang saat container di-restart, di-reboot, ataupun dilakukan soft reset.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Kami mendukung QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan kartu kredit.",
  },
]
