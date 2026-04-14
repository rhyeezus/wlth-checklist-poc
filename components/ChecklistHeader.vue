<template>
  <div
    class="border-b flex items-stretch overflow-hidden"
    :class="variant.borderColor"
    :style="{ minHeight: '88px', backgroundColor: variant.bgColor }"
  >
    <!-- Left: title -->
    <div class="flex-1 px-6 py-5 flex flex-col justify-center">
      <div class="text-lg font-semibold leading-snug" :style="{ color: variant.titleColor }">
        {{ title }}
      </div>
      <div class="text-md font-medium mt-0.5" :style="{ color: variant.subtitleColor }">
        Supporting Document Checklist
      </div>
    </div>

    <!-- Right: diagonal wedge with logomark -->
    <div
      class="flex items-center justify-center pl-10 pr-5 min-w-[96px]"
      :style="{ backgroundColor: variant.wedgeColor, clipPath: 'polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%)' }"
    >
      <!-- WLTH marque -->
      <svg
        v-if="variantKey === 'wlth'"
        viewBox="0 0 28 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-[31px] w-auto"
      >
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.96933 0L7.56963 14.5863L9.96647 6.98899H12.9345L8.83166 20H6.3076L0 0H2.96933ZM12.3099 0L18.6187 20H21.5881L15.2792 0H12.3099ZM25.0307 0L20.9265 13.011H23.8959L28 0H25.0307Z" fill="#F4F4F4"/>
      </svg>

      <!-- Mortgage Mart marque -->
      <svg
        v-else-if="variantKey === 'mortgage_mart'"
        viewBox="0 0 41 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-[20px] w-auto"
      >
        <g clip-path="url(#clip0_mma)">
          <path d="M38.2144 0C36.6785 0 35.4289 1.23465 35.4289 2.75206C35.4289 4.26947 36.6785 5.50271 38.2144 5.50271C39.7503 5.50271 41 4.26807 41 2.75206C41 1.23605 39.7503 0 38.2144 0ZM38.2144 5.24794C36.8216 5.24794 35.6867 4.12808 35.6867 2.75066C35.6867 1.37323 36.8202 0.253368 38.2144 0.253368C39.6086 0.253368 40.7421 1.37323 40.7421 2.75066C40.7421 4.12808 39.6086 5.24794 38.2144 5.24794ZM39.5562 1.55801H39.9175L39.4188 3.11041H39.0575L39.5562 1.55801ZM38.3703 1.55801L39.1368 3.94471H38.7755L38.009 1.55801H38.3703ZM37.7242 2.3923H38.0855L37.5868 3.94471H37.2793L36.5128 1.55801H36.8741L37.4337 3.29939L37.7256 2.3923H37.7242ZM34.7573 0.00279965H30.348L26.4346 12.4416L22.4914 0.00279965H18.0821V16.0014H20.8578V3.03622L24.9681 16H27.8557L31.9816 3.03622L31.9887 15.9986H33.4183L34.7587 12.4444V0.00279965H34.7573ZM0 5.53071H2.85216L2.76857 16H0V5.53071ZM16.6397 0.00279965V16.0014H13.7536L13.7507 3.05162L9.61347 16.0014H7.03477L1.90144 0.00279965H4.3087L8.30003 12.4444H8.3142L12.3112 0.00979878L16.6397 0.00279965Z" fill="white"/>
        </g>
        <defs>
          <clipPath id="clip0_mma">
            <rect width="41" height="16" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  variantKey?: string
}>()

const variantKey = computed(() => props.variantKey ?? 'wlth')
const { theme } = useVariantTheme(variantKey)

const variant = computed(() => ({
  bgColor: '#eeeef0',
  borderColor: 'border-lightgrey-300',
  subtitleColor: '#6b7280',
  titleColor: theme.value.accentColor,
  wedgeColor: theme.value.accentColor,
}))
</script>
