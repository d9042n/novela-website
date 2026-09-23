import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Save, UserRound } from 'lucide-react';
import { ApiError } from '../../data/client';
import { updateProfile, type ProfilePatch } from '../../data/authApi';
import type { AuthUser } from '../../data/types';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const MAX_DISPLAY_NAME = 60;
const MAX_BIO = 500;
const MIN_BIRTHDAY = '1900-01-01';

/** Radix Select KHÔNG nhận value rỗng (rỗng = "chưa chọn", xoá luôn item). */
const GENDER_UNSET = '__unset__';

type Gender = AuthUser['gender'];

/** Trạng thái form — toàn bộ là string để khớp thẳng với input DOM. */
interface FormState {
  displayName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  gender: Gender;
  /** '' = không có ngày sinh (input date rỗng). */
  birthday: string;
}

function stateFromUser(u: AuthUser): FormState {
  return {
    displayName: u.displayName,
    email: u.email,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    gender: u.gender,
    birthday: u.birthday ?? '',
  };
}

/** Hôm nay dạng YYYY-MM-DD theo giờ ĐỊA PHƯƠNG.
 *
 * Không dùng `toISOString()` vì nó quy về UTC: ở VN (UTC+7) từ 00:00 tới 07:00
 * ngày hôm nay sẽ ra ngày HÔM QUA, khiến user không chọn được đúng ngày hiện tại
 * và validate "không được ở tương lai" lệch một ngày. */
function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Email đủ dùng cho tầng UX. Không cố bắt chước RFC 5322 — server mới là chốt. */
function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Chỉ chấp nhận http/https: `javascript:` nhét vào src ảnh là lỗ XSS kinh điển. */
function isValidHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

type FieldName = keyof FormState;
type FieldErrors = Partial<Record<FieldName, string>>;

/**
 * Form sửa hồ sơ.
 *
 * HAI điểm không được làm sai:
 *
 * 1. DIRTY-TRACKING. `updateProfile` dựng body bằng `key in patch`, nên mọi key
 *    có mặt đều được GỬI — kể cả khi giá trị y hệt bản cũ. Gửi thừa `birthday`
 *    hay `email` là ghi đè bằng chính nó (vô hại nhưng ồn) và tệ hơn là đụng
 *    luật server (đổi email có thể reset `email_verified`). Nên chỉ nhét key
 *    khi giá trị THẬT SỰ khác `user`.
 *
 * 2. XOÁ NGÀY SINH. Input date rỗng phải thành `{birthday: null}` chứ không phải
 *    `{birthday: ''}` — core nhận null mới hiểu là xoá.
 *
 * Validate ở client là UX (báo lỗi tức thì, đỡ một vòng mạng); server VẪN là
 * chốt cuối và mọi lỗi 4xx trả về đều được map hiển thị bên dưới.
 */
export function ProfileForm() {
  const { t } = useTranslation();
  const { user, applyUser } = useAuth();

  // Route /account đã bọc guard đăng nhập, nhưng `user` vẫn có thể là
  // `undefined` trong nhịp bootstrap đầu tiên — không render form rỗng.
  const initial = user ?? null;

  const [form, setForm] = useState<FormState>(() =>
    initial ? stateFromUser(initial) : {
      displayName: '', email: '', avatarUrl: '', bio: '', gender: '', birthday: '',
    },
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [avatarBroken, setAvatarBroken] = useState(false);

  // Đồng bộ lại form khi ĐỔI tài khoản (hoặc khi `user` tới muộn sau nhịp
  // bootstrap). `useState` chỉ đọc initializer một lần, nên nếu render đầu
  // `user` còn undefined thì form giữ giá trị rỗng trong khi `initial` sau đó
  // đã có dữ liệu thật -> patch sẽ coi mọi field là "đã sửa thành rỗng" và nút
  // Lưu bật sẵn dù user chưa chạm vào gì.
  //
  // Chốt theo `user.id` chứ không theo cả object: `applyUser` sau khi lưu trả
  // về một object MỚI, nếu phụ thuộc vào nó thì effect này chạy lại và ghi đè
  // đúng những gì user đang gõ.
  const userId = initial?.id;
  useEffect(() => {
    if (!initial) return;
    setForm(stateFromUser(initial));
    setFieldErrors({});
    setFormError(null);
    setAvatarBroken(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const today = useMemo(todayLocal, []);

  const set = <K extends FieldName>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Xoá lỗi của đúng field vừa sửa: giữ lỗi cũ khi user đã sửa xong là gây
    // hiểu nhầm rằng vẫn còn sai.
    setFieldErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
    if (key === 'avatarUrl') setAvatarBroken(false);
  };

  /** Patch tối thiểu: chỉ field khác bản gốc. Rỗng = không có gì để lưu. */
  const patch: ProfilePatch = useMemo(() => {
    if (!initial) return {};
    const p: ProfilePatch = {};
    if (form.displayName !== initial.displayName) p.displayName = form.displayName;
    if (form.email !== initial.email) p.email = form.email;
    if (form.avatarUrl !== initial.avatarUrl) p.avatarUrl = form.avatarUrl;
    if (form.bio !== initial.bio) p.bio = form.bio;
    if (form.gender !== initial.gender) p.gender = form.gender;
    const originalBirthday = initial.birthday ?? '';
    if (form.birthday !== originalBirthday) {
      // '' -> null là TÍN HIỆU XOÁ, không phải chuỗi rỗng.
      p.birthday = form.birthday === '' ? null : form.birthday;
    }
    return p;
  }, [form, initial]);

  const dirty = Object.keys(patch).length > 0;

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (form.displayName.length > MAX_DISPLAY_NAME) {
      e.displayName = t('account.errors.displayNameTooLong', { max: MAX_DISPLAY_NAME });
    }
    if (form.bio.length > MAX_BIO) {
      e.bio = t('account.errors.bioTooLong', { max: MAX_BIO });
    }
    if (form.email.trim() === '' || !isValidEmail(form.email.trim())) {
      e.email = t('account.errors.invalidEmail');
    }
    if (form.avatarUrl.trim() !== '' && !isValidHttpUrl(form.avatarUrl.trim())) {
      e.avatarUrl = t('account.errors.invalidUrl');
    }
    if (form.birthday !== '') {
      if (form.birthday > today) e.birthday = t('account.errors.birthdayFuture');
      else if (form.birthday < MIN_BIRTHDAY) e.birthday = t('account.errors.birthdayTooOld');
    }
    return e;
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (submitting || !dirty) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(t('account.errors.fixFields'));
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const updated = await updateProfile(patch);
      // Cập nhật user toàn app để header/menu đổi tên ngay, không phải F5.
      // Dùng thẳng bản `updated` server vừa trả: đủ đầy nên không cần round-trip
      // `getMe()` thêm một nhịp mạng.
      applyUser(updated);
      setForm(stateFromUser(updated));
      toast.success(t('account.profile.saved'));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFieldErrors({ email: t('account.errors.emailTaken') });
          setFormError(t('account.errors.emailTaken'));
        } else if (err.status === 422) {
          // 422 = validator của core từ chối một field cụ thể. Message server ở
          // đây là thông tin DUY NHẤT cho biết field nào sai, nên hiện nguyên văn
          // thay vì nuốt bằng một câu chung chung.
          setFormError(err.message || t('account.errors.invalidData'));
        } else if (err.status === 429) {
          setFormError(t('account.errors.rateLimited'));
        } else {
          setFormError(t('account.errors.saveFailed'));
        }
      } else {
        setFormError(t('account.errors.saveFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!initial) return null;

  const avatarPreviewUrl = form.avatarUrl.trim();
  const showAvatarPreview = avatarPreviewUrl !== '' && !avatarBroken;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.15rem',
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {t('account.profile.title')}
      </h2>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* Tên hiển thị */}
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="profile-display-name">{t('account.profile.displayName')}</Label>
          <span className="text-muted-foreground tabular-nums" style={{ fontSize: '0.75rem' }}>
            {form.displayName.length}/{MAX_DISPLAY_NAME}
          </span>
        </div>
        <Input
          id="profile-display-name"
          value={form.displayName}
          onChange={(e) => set('displayName', e.target.value)}
          maxLength={MAX_DISPLAY_NAME}
          autoComplete="nickname"
          placeholder={t('account.profile.displayNamePlaceholder')}
          aria-invalid={!!fieldErrors.displayName}
          aria-describedby={
            fieldErrors.displayName ? 'profile-display-name-error' : 'profile-display-name-hint'
          }
        />
        {fieldErrors.displayName ? (
          <p id="profile-display-name-error" role="alert" className="text-destructive" style={{ fontSize: '0.8rem' }}>
            {fieldErrors.displayName}
          </p>
        ) : (
          <p id="profile-display-name-hint" className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
            {t('account.profile.displayNameHint')}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="grid gap-2">
        <Label htmlFor="profile-email">{t('account.profile.email')}</Label>
        <Input
          id="profile-email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'profile-email-error' : undefined}
        />
        {fieldErrors.email && (
          <p id="profile-email-error" role="alert" className="text-destructive" style={{ fontSize: '0.8rem' }}>
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Ảnh đại diện + preview */}
      <div className="grid gap-2">
        <Label htmlFor="profile-avatar-url">{t('account.profile.avatarUrl')}</Label>
        <div className="flex items-start gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {showAvatarPreview ? (
              // <img> trần + onError chứ không phải component avatar: cần bắt
              // được sự kiện ảnh hỏng để đổi sang placeholder, nếu không trình
              // duyệt hiện icon ảnh vỡ (khác nhau mỗi trình duyệt, luôn xấu).
              <img
                src={avatarPreviewUrl}
                alt={t('account.profile.avatarPreviewAlt')}
                className="size-full object-cover"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <UserRound className="size-6 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Input
              id="profile-avatar-url"
              type="url"
              inputMode="url"
              value={form.avatarUrl}
              onChange={(e) => set('avatarUrl', e.target.value)}
              placeholder="https://..."
              aria-invalid={!!fieldErrors.avatarUrl}
              aria-describedby={
                fieldErrors.avatarUrl
                  ? 'profile-avatar-url-error'
                  : avatarBroken
                    ? 'profile-avatar-url-broken'
                    : undefined
              }
            />
            {fieldErrors.avatarUrl && (
              <p id="profile-avatar-url-error" role="alert" className="mt-1 text-destructive" style={{ fontSize: '0.8rem' }}>
                {fieldErrors.avatarUrl}
              </p>
            )}
            {!fieldErrors.avatarUrl && avatarBroken && (
              <p
                id="profile-avatar-url-broken"
                className="mt-1 text-muted-foreground"
                style={{ fontSize: '0.8rem' }}
              >
                {t('account.profile.avatarBroken')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="profile-bio">{t('account.profile.bio')}</Label>
          <span className="text-muted-foreground tabular-nums" style={{ fontSize: '0.75rem' }}>
            {form.bio.length}/{MAX_BIO}
          </span>
        </div>
        <Textarea
          id="profile-bio"
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          maxLength={MAX_BIO}
          rows={4}
          placeholder={t('account.profile.bioPlaceholder')}
          aria-invalid={!!fieldErrors.bio}
          aria-describedby={fieldErrors.bio ? 'profile-bio-error' : undefined}
        />
        {fieldErrors.bio && (
          <p id="profile-bio-error" role="alert" className="text-destructive" style={{ fontSize: '0.8rem' }}>
            {fieldErrors.bio}
          </p>
        )}
      </div>

      {/* Giới tính + ngày sinh: hai cột từ sm trở lên, mobile xếp dọc */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="profile-gender">{t('account.profile.gender')}</Label>
          <Select
            value={form.gender === '' ? GENDER_UNSET : form.gender}
            onValueChange={(v) => set('gender', v === GENDER_UNSET ? '' : (v as Gender))}
          >
            <SelectTrigger id="profile-gender" className="w-full">
              <SelectValue placeholder={t('account.profile.genderUnset')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={GENDER_UNSET}>{t('account.profile.genderUnset')}</SelectItem>
              <SelectItem value="male">{t('account.profile.genderMale')}</SelectItem>
              <SelectItem value="female">{t('account.profile.genderFemale')}</SelectItem>
              <SelectItem value="other">{t('account.profile.genderOther')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile-birthday">{t('account.profile.birthday')}</Label>
          <Input
            id="profile-birthday"
            type="date"
            value={form.birthday}
            min={MIN_BIRTHDAY}
            max={today}
            onChange={(e) => set('birthday', e.target.value)}
            aria-invalid={!!fieldErrors.birthday}
            aria-describedby={
              fieldErrors.birthday ? 'profile-birthday-error' : 'profile-birthday-hint'
            }
          />
          {fieldErrors.birthday ? (
            <p id="profile-birthday-error" role="alert" className="text-destructive" style={{ fontSize: '0.8rem' }}>
              {fieldErrors.birthday}
            </p>
          ) : (
            <p id="profile-birthday-hint" className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
              {t('account.profile.birthdayHint')}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!dirty || submitting} className="gap-2">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t('account.profile.save')}
        </Button>
        {dirty && !submitting && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setForm(stateFromUser(initial));
              setFieldErrors({});
              setFormError(null);
              setAvatarBroken(false);
            }}
          >
            {t('account.profile.reset')}
          </Button>
        )}
        {!dirty && !submitting && (
          <span className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
            {t('account.profile.noChanges')}
          </span>
        )}
      </div>
    </form>
  );
}
