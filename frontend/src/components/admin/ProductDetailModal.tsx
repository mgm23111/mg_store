import { useState, useEffect } from 'react';
import { Product, Color, Size } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { productImageService, ProductImage, ProductImageRequest } from '../../api/productImageService';
import { productVariantService, ProductVariant, ProductVariantRequest } from '../../api/productVariantService';
import { colorService } from '../../api/colorService';
import { sizeService } from '../../api/sizeService';
import { useUIStore } from '../../stores/uiStore';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

type Tab = 'images' | 'variants';

export const ProductDetailModal = ({ isOpen, onClose, product }: ProductDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const { addToast } = useUIStore();

  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImageColorId, setNewImageColorId] = useState(0);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [addingImage, setAddingImage] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [newVariant, setNewVariant] = useState<ProductVariantRequest>({
    colorId: 0,
    sizeId: 0,
    stockQuantity: 0,
    isActive: true,
  });
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetchImages();
      fetchVariants();
      fetchColors();
      fetchSizes();
    }
  }, [isOpen, product]);

  const fetchImages = async () => {
    try {
      const data = await productImageService.getImages(product.id);
      setImages(data);
    } catch (error) {
      addToast('error', 'Error al cargar imágenes');
    }
  };

  const fetchVariants = async () => {
    try {
      const data = await productVariantService.getVariants(product.id);
      setVariants(data);
    } catch (error) {
      addToast('error', 'Error al cargar variantes');
    }
  };

  const fetchColors = async () => {
    try {
      const data = await colorService.getAll();
      setColors(data);
    } catch (error) {
      addToast('error', 'Error al cargar colores');
    }
  };

  const fetchSizes = async () => {
    try {
      const data = await sizeService.getAll();
      setSizes(data);
    } catch (error) {
      addToast('error', 'Error al cargar tallas');
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      addToast('error', 'La URL de la imagen es requerida');
      return;
    }

    try {
      setAddingImage(true);
      const imageData: ProductImageRequest = {
        url: newImageUrl,
        altText: newImageAlt || product.name,
        isPrimary: images.length === 0, // First image is primary
        sortOrder: images.length,
        colorId: newImageColorId > 0 ? newImageColorId : undefined,
      };

      await productImageService.addImage(product.id, imageData);
      addToast('success', 'Imagen agregada correctamente');
      setNewImageUrl('');
      setNewImageAlt('');
      setNewImageColorId(0);
      fetchImages();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al agregar imagen');
    } finally {
      setAddingImage(false);
    }
  };

  const handleUploadImage = async () => {
    if (!newImageFile) {
      addToast('error', 'Debes seleccionar un archivo de imagen');
      return;
    }

    try {
      setAddingImage(true);
      await productImageService.uploadImage(product.id, newImageFile, {
        altText: newImageAlt || product.name,
        isPrimary: images.length === 0,
        sortOrder: images.length,
        colorId: newImageColorId > 0 ? newImageColorId : undefined,
      });
      addToast('success', 'Imagen subida correctamente');
      setNewImageFile(null);
      setNewImageUrl('');
      setNewImageAlt('');
      setNewImageColorId(0);
      fetchImages();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al subir imagen');
    } finally {
      setAddingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      await productImageService.deleteImage(imageId);
      addToast('success', 'Imagen eliminada correctamente');
      fetchImages();
    } catch (error) {
      addToast('error', 'Error al eliminar imagen');
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      await productImageService.updateImage(imageId, {
        url: image.url,
        altText: image.altText,
        isPrimary: true,
        sortOrder: image.sortOrder,
        colorId: image.colorId ?? undefined,
      });

      addToast('success', 'Imagen principal actualizada');
      fetchImages();
    } catch (error) {
      addToast('error', 'Error al actualizar imagen');
    }
  };

  const handleAddVariant = async () => {
    if (newVariant.colorId === 0 || newVariant.sizeId === 0) {
      addToast('error', 'Debes seleccionar un color y una talla');
      return;
    }

    if (newVariant.stockQuantity < 0) {
      addToast('error', 'El stock no puede ser negativo');
      return;
    }

    try {
      setAddingVariant(true);
      await productVariantService.addVariant(product.id, newVariant);
      addToast('success', 'Variante agregada correctamente');
      setNewVariant({
        colorId: 0,
        sizeId: 0,
        stockQuantity: 0,
        isActive: true,
      });
      fetchVariants();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al agregar variante');
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta variante?')) return;

    try {
      await productVariantService.deleteVariant(variantId);
      addToast('success', 'Variante eliminada correctamente');
      fetchVariants();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Error al eliminar variante');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-600 text-sm mt-1">Gestionar imágenes y variantes</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('images')}
                className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'images'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Imágenes ({images.length})
              </button>
              <button
                onClick={() => setActiveTab('variants')}
                className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'variants'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Variantes ({variants.length})
              </button>
            </div>
          </div>

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Add Image Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Agregar Nueva Imagen</h3>
                <div className="space-y-3">
                  <Input
                    label="URL de la Imagen"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Input
                    label="Texto Alternativo (opcional)"
                    placeholder={product.name}
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Color (opcional)</label>
                    <select
                      value={newImageColorId}
                      onChange={(e) => setNewImageColorId(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={0}>Imagen general (todos los colores)</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleAddImage}
                    isLoading={addingImage}
                    className="w-full"
                  >
                    Agregar Imagen por URL
                  </Button>
                  <Input
                    label="Archivo de Imagen"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    onClick={handleUploadImage}
                    isLoading={addingImage}
                    className="w-full"
                    variant="outline"
                  >
                    Subir Imagen desde Archivo
                  </Button>
                </div>
              </div>

              {/* Images List */}
              <div>
                <h3 className="font-semibold mb-4">Imágenes del Producto</h3>
                {images.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay imágenes. Agrega la primera imagen arriba.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`border-2 rounded-lg p-2 ${
                          image.isPrimary ? 'border-purple-600' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.altText || product.name}
                          className="w-full h-40 object-cover rounded mb-2"
                        />
                        {image.isPrimary && (
                          <div className="text-xs font-semibold text-purple-600 mb-2">
                            ⭐ Imagen Principal
                          </div>
                        )}
                        <div className="text-xs text-gray-600 mb-2">
                          {image.colorId
                            ? `Color: ${colors.find(c => c.id === image.colorId)?.name || `ID ${image.colorId}`}`
                            : 'Color: General'}
                        </div>
                        <div className="flex gap-2">
                          {!image.isPrimary && (
                            <button
                              onClick={() => handleSetPrimaryImage(image.id)}
                              className="text-xs text-purple-600 hover:underline flex-1"
                            >
                              Hacer principal
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Add Variant Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Agregar Nueva Variante</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <select
                      value={newVariant.colorId}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, colorId: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={0}>Selecciona un color</option>
                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Talla</label>
                    <select
                      value={newVariant.sizeId}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, sizeId: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={0}>Selecciona una talla</option>
                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      label="Stock Inicial"
                      type="number"
                      min="0"
                      value={newVariant.stockQuantity}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          stockQuantity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      onClick={handleAddVariant}
                      isLoading={addingVariant}
                      className="w-full"
                    >
                      Agregar Variante
                    </Button>
                  </div>
                </div>
              </div>

              {/* Variants List */}
              <div>
                <h3 className="font-semibold mb-4">Variantes del Producto</h3>
                {variants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay variantes. Agrega la primera variante arriba.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.color.hexCode }}
                            title={variant.color.name}
                          />
                          <div>
                            <div className="font-medium">
                              {variant.color.name} - {variant.size.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              SKU: {variant.sku} | Stock: {variant.stockQuantity}
                              {variant.reservedQuantity > 0 &&
                                ` (${variant.reservedQuantity} reservado)`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t flex justify-end">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
