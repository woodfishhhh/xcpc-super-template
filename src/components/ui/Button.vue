<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'border border-primary bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050505]',
        secondary: 'border border-primary bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-background',
        ghost: 'text-foreground hover:-translate-y-0.5 hover:bg-secondary',
        outline: 'border border-primary bg-background hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground',
        destructive: 'border border-primary bg-destructive text-destructive-foreground hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#050505]'
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'default',
    size: 'default'
  }
)

const attrs = useAttrs()
const delegatedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), attrs.class as string)"
    v-bind="delegatedAttrs"
  >
    <slot />
  </button>
</template>
