import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Bắt lỗi runtime của cây React để hiển thị thông báo thay vì trang trắng/đơ.
 * Giúp chẩn đoán khi có sự cố ở phía trình duyệt.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log ra console để debug trên preview.
    console.error('Novela runtime error:', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <p
            style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}
          >
            Đã xảy ra lỗi
          </p>
          <p className="text-muted-foreground" style={{ fontSize: '0.95rem' }}>
            Ứng dụng gặp sự cố khi hiển thị. Chi tiết lỗi bên dưới:
          </p>
          <pre className="max-h-48 w-full overflow-auto rounded-md border border-border bg-muted p-3 text-left" style={{ fontSize: '0.78rem' }}>
            {error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
