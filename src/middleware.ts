import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get('_chatwoot_session')?.value;
    console.log(sessionCookie)
  // Se não tem cookie e não está na página pública ("/"), redireciona
  if (!sessionCookie && path !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const response = await fetch('https://chat.cognic.tech/api/v1/profile', {
        headers: {
          Cookie: `_chatwoot_session=${sessionCookie}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        isAuthenticated = true;
      } else {
        console.warn('Sessão inválida no Chatwoot:', response.status);
      }
    } catch (error) {
      console.error('Erro ao validar sessão do Chatwoot:', error);
    }
  }

  // Se o usuário não estiver autenticado, redireciona para "/"
  if (!isAuthenticated && path !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)'],
};
