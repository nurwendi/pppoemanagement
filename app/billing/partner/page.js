            >
                <div className="absolute top-0 right-0 p-12 opacity-10 transform rotate-12">
                    <ShieldCheck size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-xl font-bold mb-2">Info Partner</h3>
                    <p className="text-indigo-200 mb-6">
                        Komisi dihitung berdasarkan pembayaran yang statusnya "Completed".
                        Pastikan memverifikasi pembayaran dari pelanggan agar komisi masuk ke akun Anda.
                    </p>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                            <span className="block text-xs text-indigo-300 uppercase tracking-widest">Rate Agen</span>
                            <span className="text-lg font-bold">Variable</span>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                            <span className="block text-xs text-indigo-300 uppercase tracking-widest">Status</span>
                            <span className="text-lg font-bold text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div >
        </div >
    );
}
