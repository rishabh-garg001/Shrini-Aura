import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../lib/api';
import { Button, Spinner, Badge } from '../../components/ui';
import toast from 'react-hot-toast';
const CATEGORIES = [
  'Floral Bliss',
  'Vanilla Dreams',
  'Festive Lights',
  'Ocean Breeze',
  'Luxury Gold Collection',
];

function ProductForm({ product, onClose }) {
  const { register, handleSubmit } = useForm({
    defaultValues: product || {},
  });

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // MULTI IMAGES
  const [imageUrls, setImageUrls] = useState(
    product?.images || []
  );

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (imageUrls.length + files.length > 5) {
      return toast.error(
        'Maximum 5 images allowed'
      );
    }

    setUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append('images', file);
      });

      const { data } = await api.post(
        '/products/upload-image',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      // backend returns array
      setImageUrls((prev) => [
        ...prev,
        ...data,
      ]);

      toast.success('Images uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImageUrls((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        images: imageUrls,
      };

      if (product) {
        await api.put(
          `/products/${product._id}`,
          payload
        );
      } else {
        await api.post(
          '/products',
          payload
        );
      }

      queryClient.invalidateQueries([
        'admin-products',
      ]);

      toast.success(
        product
          ? 'Product updated!'
          : 'Product created!'
      );

      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'name',
      label: 'Product Name',
      required: true,
    },
    {
      name: 'shortDescription',
      label: 'Short Description',
    },
    {
      name: 'price',
      label: 'Price (₹)',
      type: 'number',
      required: true,
    },
    {
      name: 'discountPrice',
      label: 'Discount Price (₹)',
      type: 'number',
    },
    {
      name: 'stock',
      label: 'Stock',
      type: 'number',
      required: true,
    },
    {
      name: 'weight',
      label: 'Weight',
    },
    {
      name: 'burnTime',
      label: 'Burn Time',
    },
    {
      name: 'scent',
      label: 'Scent Notes',
    },
    {
      name: 'ingredients',
      label:
        'Ingredients (comma separated)',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold">
            {product
              ? 'Edit Product'
              : 'Add Product'}
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          {/* MULTI IMAGE */}
          <div className="col-span-2">
            <label className="text-sm font-medium mb-2 block">
              Product Images
            </label>

            {/* Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-4">
                {imageUrls.map(
                  (img, index) => (
                    <div
                      key={index}
                      className="relative"
                    >
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-20 object-cover rounded-xl border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <label
              className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 cursor-pointer transition-colors ${
                uploading
                  ? 'opacity-50 border-gray-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gold'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={
                  handleImageUpload
                }
                className="hidden"
                disabled={uploading}
              />

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {uploading
                  ? '⏳ Uploading...'
                  : '📷 Upload up to 5 images'}
              </span>
            </label>
          </div>

                    {fields.map((f) => (
            <div
              key={f.name}
              className={
                f.name === 'name' ||
                f.name ===
                  'shortDescription'
                  ? 'col-span-2'
                  : ''
              }
            >
              <label className="text-sm font-medium mb-1 block">
                {f.label}
              </label>

              <input
                {...register(
                  f.name,
                  {
                    required:
                      f.required,
                  }
                )}
                type={
                  f.type || 'text'
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:border-gold"
              />
            </div>
          ))}

          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>

            <textarea
              {...register(
                'description',
                {
                  required: true,
                }
              )}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:border-gold resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Category
            </label>

            <select
              {...register(
                'category',
                {
                  required: true,
                }
              )}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none focus:border-gold"
            >
              {CATEGORIES.map(
                (c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                {...register(
                  'isFeatured'
                )}
                className="accent-gold"
              />
              Featured
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                {...register(
                  'isActive'
                )}
                defaultChecked
                className="accent-gold"
              />
              Active
            </label>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3 mt-2">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              {product
                ? 'Update'
                : 'Create'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ===========================
   ADMIN PRODUCTS WRAPPER
=========================== */

export default function AdminProducts() {
    const [modal, setModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  

  const queryClient =
    useQueryClient();

  const { data, isLoading } =
    useQuery({
      queryKey: [
        'admin-products',
      ],
      queryFn: () =>
        api
          .get('/products', {
            params: {
              limit: 100,
            },
          })
          .then(
            (r) => r.data
          ),
    });

  const deleteMutation =
    useMutation({
      mutationFn: (id) =>
        api.delete(
          `/products/${id}`
        ),

      onSuccess: () => {
        queryClient.invalidateQueries(
          ['admin-products']
        );
        toast.success(
          'Deleted!'
        );
      },
    });

  if (isLoading)
    return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">
          Products (
          {data?.total})
        </h1>

        <Button
          onClick={() =>
            setModal(
              'create'
            )
          }
        >
          <Plus
            size={16}
            className="mr-2"
          />
          Add Product
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-500 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-3">
                  Product
                </th>
                <th className="px-4 py-3">
                  Category
                </th>
                <th className="px-4 py-3">
                  Price
                </th>
                <th className="px-4 py-3">
                  Stock
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-gray-800">
              {data?.products?.map(
                (p) => (
                  <tr
                    key={
                      p._id
                    }
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            p
                              .images?.[0]
                              ?.url
                          }
                          alt={
                            p.name
                          }
                          className="w-10 h-10 object-cover rounded-lg"
                        />

                        <span className="font-medium line-clamp-1">
                          {
                            p.name
                          }
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {
                        p.category
                      }
                    </td>

                    <td className="px-4 py-3">
                      ₹
                      {p.discountPrice >
                      0
                        ? p.discountPrice
                        : p.price}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        color={
                          p.stock >
                          10
                            ? 'green'
                            : p.stock >
                                0
                              ? 'gold'
                              : 'red'
                        }
                      >
                        {
                          p.stock
                        }
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        color={
                          p.isActive
                            ? 'green'
                            : 'red'
                        }
                      >
                        {p.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setModal(
                              p
                            )
                          }
                          className="p-1.5 hover:text-gold transition-colors"
                        >
                          <Edit
                            size={
                              16
                            }
                          />
                        </button>

                        <button
  onClick={() => setDeleteModal(p)}
  className="p-1.5 hover:text-red-500 transition-colors"
>
  <Trash2 size={16} />
</button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ProductForm
            product={
              modal ===
              'create'
                ? null
                : modal
            }
            onClose={() =>
              setModal(
                null
              )
            }
          />
        )}
        
  {deleteModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <Trash2 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Delete Product
            </h2>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Product */}
        <div className="border rounded-xl p-3 mb-6 flex items-center gap-3">
          <img
            src={deleteModal.images?.[0]?.url}
            alt={deleteModal.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold">
              {deleteModal.name}
            </p>
            <p className="text-sm text-gray-500">
              {deleteModal.category}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              setDeleteModal(null)
            }
            className="flex-1 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              deleteMutation.mutate(
                deleteModal._id
              );
              setDeleteModal(null);
            }}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
