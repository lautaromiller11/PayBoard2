export default function Footer() {
    return (
        <footer className="bg-white border-t py-4 mt-8">
            <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
                © {new Date().getFullYear()} PayBoard. Todos los derechos reservados.
            </div>
        </footer>
    );
}
