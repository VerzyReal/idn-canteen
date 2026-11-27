export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-6 text-center">
      <div className="text-7xl mb-6">🍽️</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-400 mb-8 max-w-sm">
        Sepertinya menu yang kamu cari sudah habis atau tidak ada. Yuk kembali ke beranda!
      </p>
      <a href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary-500 text-white font-semibold">
        🏠 Kembali ke Beranda
      </a>
    </div>
  );
}

