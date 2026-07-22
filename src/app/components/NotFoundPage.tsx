import { RouterLink } from './ui/router-link';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-28 text-center">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
        404
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600 }}>
        {t('common.notFound')}
      </h1>
      <p className="text-muted-foreground">{t('common.notFoundDesc')}</p>
      <Button asChild size="lg" className="mt-2">
        <RouterLink to="/">{t('nav.home')}</RouterLink>
      </Button>
    </div>
  );
}
