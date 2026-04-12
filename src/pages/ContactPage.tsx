import { useForm, SubmitHandler } from 'react-hook-form'
import { toast } from '@/components/ui/Toast'
import { useReveal } from '@/hooks/useReveal'

type Inputs = {
  name: string
  email: string
  message: string
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = useForm<Inputs>()

  useReveal()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const whatsappNumber = '212625638262'
    const text = `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`

    reset()
    window.location.href = whatsappUrl
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="page py-12 md:py-16 reveal">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider mb-4">
            Contact Us
          </h1>
          <p className="text-stone-400 mb-8 md:mb-12">
            Have a question or feedback? Fill out the form below to get in touch with us.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500 outline-none focus:border-brand-500"
                placeholder="Your Name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500 outline-none focus:border-brand-500"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-stone-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                {...register('message', { required: 'Message is required' })}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500 outline-none focus:border-brand-500"
                placeholder="How can we help you?"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-outline-white w-full md:w-auto"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}