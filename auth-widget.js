const auth = window.bccAuth;

function mountAuthWidget() {
  const target = document.getElementById('auth-widget');
  if (!target || !auth) return;

  async function render() {
    const session = await auth.getSession();
    const owner = await auth.isOwner();
    if (!session) {
      target.innerHTML = `
        <form id="auth-signin-form" class="console-form auth-widget-form">
          <label><span>登录邮箱</span><input name="email" type="email" placeholder="你的邮箱" required /></label>
          <button class="ghost-btn" type="submit">发送登录链接</button>
          <div class="muted" id="auth-status"></div>
        </form>
      `;
      document.getElementById('auth-signin-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get('email') || '').trim();
        const status = document.getElementById('auth-status');
        status.textContent = '正在发送登录链接...';
        const { error } = await auth.signInWithEmail(email);
        status.textContent = error ? `发送失败：${error.message}` : '登录链接已发送，请去邮箱确认。';
      });
      return;
    }

    target.innerHTML = `
      <div class="auth-widget-card">
        <div><strong>${session.user.email || '已登录'}</strong></div>
        <div class="muted">权限：${owner ? 'Owner / 可写' : '只读'}</div>
        <button class="ghost-btn" id="auth-signout-btn" type="button">退出登录</button>
      </div>
    `;
    document.getElementById('auth-signout-btn')?.addEventListener('click', async () => {
      await auth.signOut();
      render();
      window.location.reload();
    });
  }

  render();
}

document.addEventListener('DOMContentLoaded', mountAuthWidget);
