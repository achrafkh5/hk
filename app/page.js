import Header from '@/components/client/Header';
import Hero from '@/components/client/Hero';
import Categories from '@/components/client/Categories';
import FeaturedProducts from '@/components/client/FeaturedProducts';
import Footer from '@/components/client/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
