import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  name: string;
  article: string;
  zone: 'A' | 'B' | 'C' | 'D';
  cell: string;
  quantity: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Смартфон Samsung Galaxy', article: 'SM-001', zone: 'A', cell: 'A-12', quantity: 45 },
  { id: '2', name: 'Ноутбук Lenovo ThinkPad', article: 'LP-003', zone: 'A', cell: 'A-08', quantity: 12 },
  { id: '3', name: 'Наушники Sony WH-1000', article: 'SN-045', zone: 'B', cell: 'B-23', quantity: 78 },
  { id: '4', name: 'Клавиатура Logitech MX', article: 'LG-012', zone: 'B', cell: 'B-15', quantity: 34 },
  { id: '5', name: 'Монитор Dell UltraSharp', article: 'DL-089', zone: 'C', cell: 'C-05', quantity: 19 },
  { id: '6', name: 'Мышь Razer DeathAdder', article: 'RZ-023', zone: 'C', cell: 'C-31', quantity: 56 },
  { id: '7', name: 'Планшет Apple iPad Pro', article: 'AP-007', zone: 'D', cell: 'D-17', quantity: 23 },
  { id: '8', name: 'Роутер TP-Link Archer', article: 'TP-056', zone: 'D', cell: 'D-09', quantity: 41 },
];

const zoneColors = {
  A: 'bg-primary text-white',
  B: 'bg-secondary text-white',
  C: 'bg-accent text-white',
  D: 'bg-pink-500 text-white',
};

const zoneBorderColors = {
  A: 'border-primary',
  B: 'border-secondary',
  C: 'border-accent',
  D: 'border-pink-500',
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      const found = products.find(
        (p) => p.article.toLowerCase().includes(value.toLowerCase()) || 
               p.id.toLowerCase().includes(value.toLowerCase())
      );
      setFoundProduct(found || null);
    } else {
      setFoundProduct(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const newProducts: Product[] = jsonData.map((row, index) => ({
          id: String(row['ID'] || row['id'] || index + 1),
          name: String(row['Название'] || row['name'] || row['Товар'] || ''),
          article: String(row['Артикул'] || row['article'] || row['Код'] || ''),
          zone: (String(row['Зона'] || row['zone'] || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D'),
          cell: String(row['Ячейка'] || row['cell'] || ''),
          quantity: Number(row['Количество'] || row['quantity'] || 0),
        }));

        setProducts(newProducts);
        toast({
          title: 'Файл загружен!',
          description: `Импортировано ${newProducts.length} товаров`,
        });
      } catch (error) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Проверьте формат Excel файла',
          variant: 'destructive',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.cell.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Icon name="Package" size={48} className="text-primary" />
            Складская система
          </h1>
          <p className="text-muted-foreground text-lg">
            Быстрый поиск товаров по коду и артикулу
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="search" className="text-base">
              <Icon name="Search" size={18} className="mr-2" />
              Поиск
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-base">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Справочник
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6 animate-scale-in">
            <Card className="p-6 md:p-8 shadow-lg">
              <div className="relative">
                <Icon
                  name="Search"
                  size={24}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder="Введите код товара или артикул..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-14 h-16 text-xl border-2 focus:border-primary"
                />
              </div>
            </Card>

            {foundProduct && (
              <Card className={`p-8 shadow-xl border-4 ${zoneBorderColors[foundProduct.zone]} animate-scale-in`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${zoneColors[foundProduct.zone]} text-lg px-4 py-2`}>
                        Зона {foundProduct.zone}
                      </Badge>
                      <span className="text-muted-foreground">Артикул: {foundProduct.article}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{foundProduct.name}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border-2 border-primary">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="MapPin" size={28} className="text-primary" />
                      <span className="text-sm text-muted-foreground font-medium">Расположение</span>
                    </div>
                    <div className="text-5xl font-bold text-primary animate-pulse-slow">
                      {foundProduct.cell}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 border-2 border-secondary">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Package" size={28} className="text-secondary" />
                      <span className="text-sm text-muted-foreground font-medium">Количество</span>
                    </div>
                    <div className="text-5xl font-bold text-secondary">
                      {foundProduct.quantity} шт
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {searchQuery && !foundProduct && (
              <Card className="p-8 text-center border-2 border-dashed animate-fade-in">
                <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">Товар не найден</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Проверьте правильность кода или артикула
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="catalog" className="animate-scale-in">
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Icon name="FileSpreadsheet" size={24} className="text-primary" />
                    Импорт из Excel
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Загрузите файл со столбцами: ID, Название, Артикул, Зона, Ячейка, Количество
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="gap-2"
                  >
                    <Icon name="Upload" size={20} />
                    Загрузить Excel
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className="p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in border-l-4"
                  style={{
                    borderLeftColor: `hsl(var(--zone-${product.zone.toLowerCase()}))`,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge className={`${zoneColors[product.zone]} px-3 py-1`}>
                      Зона {product.zone}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{product.article}</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-3 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Icon name="MapPin" size={16} />
                      <span className="text-base">{product.cell}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Package" size={16} />
                      <span>{product.quantity} шт</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-2 animate-fade-in">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-xl ${zoneColors.A} flex items-center justify-center text-2xl font-bold`}>
                A
              </div>
              <p className="text-sm font-medium">Электроника</p>
            </div>
            <div>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-xl ${zoneColors.B} flex items-center justify-center text-2xl font-bold`}>
                B
              </div>
              <p className="text-sm font-medium">Периферия</p>
            </div>
            <div>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-xl ${zoneColors.C} flex items-center justify-center text-2xl font-bold`}>
                C
              </div>
              <p className="text-sm font-medium">Аксессуары</p>
            </div>
            <div>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-xl ${zoneColors.D} flex items-center justify-center text-2xl font-bold`}>
                D
              </div>
              <p className="text-sm font-medium">Сетевое оборудование</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;