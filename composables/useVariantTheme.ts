interface VariantTheme {
  accentColor: string
  badgeColor: string
  badgeVariant: string
  buttonColor: string
}

const themes: Record<string, VariantTheme> = {
  wlth: {
    accentColor: '#2f54eb',  // royalblue-500
    badgeColor: 'primary',
    badgeVariant: 'subtle',
    buttonColor: 'primary',
  },
  mortgage_mart: {
    accentColor: '#292e3a',  // darkblue-500
    badgeColor: 'secondary',
    badgeVariant: 'subtle',
    buttonColor: 'secondary',
  },
}

export function useVariantTheme(variantKey: Ref<string | null | undefined>) {
  const theme = computed<VariantTheme>(
    () => themes[variantKey.value ?? 'wlth'] ?? themes.wlth
  )

  const accentStyle = computed(() => ({ color: theme.value.accentColor }))
  const accentBgStyle = computed(() => ({ backgroundColor: theme.value.accentColor }))
  const accentBorderBgStyle = computed(() => ({
    backgroundColor: theme.value.accentColor,
    borderColor: theme.value.accentColor,
  }))

  return { theme, accentStyle, accentBgStyle, accentBorderBgStyle }
}
