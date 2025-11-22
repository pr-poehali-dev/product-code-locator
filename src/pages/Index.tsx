import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Product {
  code: string;
  article: string;
  name: string;
  cell: string;
  [key: string]: string | number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim() && products.length > 0) {
      const found = products.find(
        (p) => 
          p.code?.toLowerCase().includes(value.toLowerCase()) || 
          p.article?.toLowerCase().includes(value.toLowerCase())
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

        const newProducts: Product[] = jsonData.map((row) => ({
          code: String(row['Код'] || row['код'] || row['ID'] || row['id'] || ''),
          article: String(row['Артикул'] || row['артикул'] || row['Article'] || ''),
          name: String(row['Название'] || row['название'] || row['Товар'] || row['Name'] || ''),
          cell: String(row['Ячейка'] || row['ячейка'] || row['Cell'] || ''),
          ...row
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon name="Package" size={48} className="text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Поиск товаров
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Быстрый поиск по коду и артикулу
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Icon name="FileSpreadsheet" size={64} className="mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Загрузите Excel файл</h2>
            <p className="text-muted-foreground mb-6">
              Файл должен содержать столбцы: Код, Артикул, Название, Ячейка
            </p>
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
              Выбрать файл
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={24} className="text-green-500" />
                  <span className="font-semibold">Загружено {products.length} товаров</span>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Icon name="Upload" size={16} />
                  Загрузить другой файл
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
              </div>

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
                  autoFocus
                />
              </div>
            </Card>

            {foundProduct && (
              <Card className="p-8 shadow-xl border-4 border-primary animate-scale-in">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary text-white text-base px-4 py-1">
                      {foundProduct.article}
                    </Badge>
                    <span className="text-muted-foreground">Код: {foundProduct.code}</span>
                  </div>
                  <h2 className="text-3xl font-bold">{foundProduct.name}</h2>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 border-2 border-primary">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon name="MapPin" size={32} className="text-primary" />
                    <span className="text-lg text-muted-foreground font-medium">Расположение товара</span>
                  </div>
                  <div className="text-6xl font-bold text-primary animate-pulse">
                    {foundProduct.cell}
                  </div>
                </div>
              </Card>
            )}

            {searchQuery && !foundProduct && (
              <Card className="p-8 text-center border-2 border-dashed">
                <Icon name="SearchX" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">Товар не найден</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Проверьте правильность кода или артикула
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
