import { Check, Moon, Palette, Sun, PanelTop, Sidebar, Dock, Globe, Settings2, RotateCcw, Type, Minus, Plus, AlignJustify, MoveHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { useTheme } from '../../theme/ThemeProvider';
import {
  ALWAYS_DARK_THEMES,
  SHELL_LAYOUTS,
  SITE_FONTS,
  SITE_THEMES,
  type ShellLayout,
} from '../../theme/config';
import { LanguageSwitcher } from './LanguageSwitcher';

const SHELL_ICONS: Record<ShellLayout, typeof PanelTop> = {
  topnav: PanelTop,
  sidebar: Sidebar,
  dock: Dock,
};

interface SiteSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteSettingsModal({ open, onOpenChange }: SiteSettingsModalProps) {
  const { t } = useTranslation();
  const {
    siteTheme,
    setSiteTheme,
    siteFont,
    setSiteFont,
    siteLineHeight,
    setSiteLineHeight,
    siteLetterSpacing,
    setSiteLetterSpacing,
    isDark,
    toggleMode,
    shellLayout,
    setShellLayout,
    resetDefaults,
  } = useTheme();

  const modeLocked = ALWAYS_DARK_THEMES.includes(siteTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings2 className="size-5 text-primary" />
            <span>{t('settings.theme')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('app.tagline')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="theme" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="theme" className="gap-1.5 text-xs font-semibold px-2 py-2">
              <Palette className="size-3.5 shrink-0" />
              <span className="truncate">{t('settings.siteTabs.theme')}</span>
            </TabsTrigger>
            <TabsTrigger value="shell" className="gap-1.5 text-xs font-semibold px-2 py-2">
              <PanelTop className="size-3.5 shrink-0" />
              <span className="truncate">{t('settings.siteTabs.shell')}</span>
            </TabsTrigger>
            <TabsTrigger value="font" className="gap-1.5 text-xs font-semibold px-2 py-2">
              <Type className="size-3.5 shrink-0" />
              <span className="truncate">{t('settings.siteTabs.font')}</span>
            </TabsTrigger>
            <TabsTrigger value="lang" className="gap-1.5 text-xs font-semibold px-2 py-2">
              <Globe className="size-3.5 shrink-0" />
              <span className="truncate">{t('settings.siteTabs.lang')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Fixed height tab body container to prevent layout shifts when switching tabs */}
          <div className="h-[360px] overflow-y-auto pr-1 mt-2">
            {/* Tab 1: Theme & Mode */}
            <TabsContent value="theme" className="space-y-5 py-2 mt-0">
              {/* Light / Dark Mode Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('settings.darkMode')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => isDark && toggleMode()}
                    disabled={modeLocked}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      !isDark
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="size-4 text-amber-500" />
                      {t('settings.lightMode')}
                    </span>
                    {!isDark && <Check className="size-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => !isDark && toggleMode()}
                    disabled={modeLocked}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isDark
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border bg-card text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="size-4 text-sky-400" />
                      {t('settings.darkMode')}
                    </span>
                    {isDark && <Check className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Site Theme Swatches */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('settings.themePalette')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SITE_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSiteTheme(th.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        siteTheme === th.id
                          ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-sm'
                          : 'border-border bg-card/60 text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="size-4 shrink-0 rounded-full border border-black/15 shadow-sm"
                          style={{ backgroundColor: th.swatch }}
                        />
                        <span>{t(th.labelKey)}</span>
                      </span>
                      {siteTheme === th.id && <Check className="size-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: App Shell */}
            <TabsContent value="shell" className="space-y-3 py-2 mt-0">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('settings.shellLayoutTitle')}
              </label>
              <div className="space-y-2">
                {SHELL_LAYOUTS.map((s) => {
                  const Icon = SHELL_ICONS[s.id];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShellLayout(s.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                        shellLayout === s.id
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background border border-border">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-foreground">{t(s.labelKey)}</div>
                        </div>
                      </span>
                      {shellLayout === s.id && <Check className="size-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab 3: Site Font & Typography */}
            <TabsContent value="font" className="space-y-4 py-2 mt-0">
              {/* Khoảng cách dòng & Khoảng cách ký tự */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-card/40">
                {/* Line height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <AlignJustify className="size-3.5 text-primary" />
                      {t('settings.siteLineHeight')}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1.0}
                        max={2.5}
                        step={0.05}
                        value={siteLineHeight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setSiteLineHeight(Math.max(1.0, Math.min(2.5, Number(val.toFixed(2)))));
                          }
                        }}
                        className="w-14 text-right font-mono text-xs font-bold bg-background border border-border/80 rounded-md py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground font-mono">x</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={siteLineHeight}
                    onChange={(e) => setSiteLineHeight(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                </div>

                {/* Letter spacing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MoveHorizontal className="size-3.5 text-primary" />
                      {t('settings.siteLetterSpacing')}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={-1.5}
                        max={4.0}
                        step={0.1}
                        value={siteLetterSpacing}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setSiteLetterSpacing(Math.max(-1.5, Math.min(4.0, Number(val.toFixed(1)))));
                          }
                        }}
                        className="w-14 text-right font-mono text-xs font-bold bg-background border border-border/80 rounded-md py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground font-mono">px</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={4.0}
                    step={0.1}
                    value={siteLetterSpacing}
                    onChange={(e) => setSiteLetterSpacing(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Danh sách Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('settings.siteFontTitle')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SITE_FONTS.map((f) => {
                    const active = siteFont === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSiteFont(f.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          active
                            ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                            : 'border-border bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        <div className="text-left space-y-0.5" style={{ fontFamily: f.fontCss, lineHeight: siteLineHeight, letterSpacing: `${siteLetterSpacing}px` }}>
                          <div className="text-sm font-bold text-foreground">{f.name}</div>
                          <div className="text-xs opacity-75">{t(f.labelKey)}</div>
                        </div>
                        {active && <Check className="size-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Language */}
            <TabsContent value="lang" className="space-y-4 py-2 mt-0">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('settings.language')}
              </label>
              <div className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between">
                <span className="text-xs font-medium">{t('settings.selectLanguage')}:</span>
                <LanguageSwitcher />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer với Nút Reset Default */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetDefaults}
            className="gap-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>{t('settings.resetDefaults')}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold px-4"
          >
            {t('actions.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
