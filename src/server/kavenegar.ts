/**
 * Kavenegar (کاوه نگار) SMS OTP integration service
 * Supports lookup template OTP and standard SMS fallback
 */

export interface SendOtpOptions {
  receptor: string;
  code: string;
  apiKey?: string;
  template?: string;
}

export interface SendOtpResult {
  success: boolean;
  simulated: boolean;
  message: string;
  code?: string;
}

export async function sendKavenegarOtp(options: SendOtpOptions): Promise<SendOtpResult> {
  const { receptor, code, apiKey, template = 'verify' } = options;

  // If no API key provided in settings, run in clean test/simulation mode
  if (!apiKey || apiKey.trim() === '') {
    console.log(`[Kavenegar Dev Mode] Sending OTP code ${code} to ${receptor}`);
    return {
      success: true,
      simulated: true,
      code,
      message: `کد تایید برای ${receptor} ارسال شد (کد تستی: ${code})`,
    };
  }

  try {
    // 1. Try Kavenegar Lookup Verify endpoint (Fast, high-priority OTP)
    const lookupUrl = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey.trim())}/verify/lookup.json`;
    const params = new URLSearchParams({
      receptor,
      token: code,
      template: template || 'verify',
    });

    const response = await fetch(`${lookupUrl}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = (await response.json()) as any;

    if (json?.return?.status === 200) {
      return {
        success: true,
        simulated: false,
        message: 'کد تایید با موفقیت از طریق کاوه نگار ارسال شد.',
      };
    }

    // 2. Fallback to direct SMS endpoint if template isn't registered on Kavenegar account
    console.warn(`[Kavenegar Lookup Warning] status: ${json?.return?.status}, trying direct SMS...`);
    const sendUrl = `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey.trim())}/sms/send.json`;
    const sendParams = new URLSearchParams({
      receptor,
      message: `کد تایید ورود به سام‌استایل (SAMSTYLE):\n${code}`,
    });

    const sendResponse = await fetch(`${sendUrl}?${sendParams.toString()}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const sendJson = (await sendResponse.json()) as any;

    if (sendJson?.return?.status === 200) {
      return {
        success: true,
        simulated: false,
        message: 'کد تایید با پیامک مستقیم ارسال شد.',
      };
    }

    const errorMsg = sendJson?.return?.message || json?.return?.message || 'خطا در ارتباط با کاوه نگار';
    console.error('[Kavenegar Error]', errorMsg);
    // If live call returned error (e.g. invalid key or no credit), provide clear feedback and fallback code for test
    return {
      success: true,
      simulated: true,
      code,
      message: `پاسخ کاوه نگار: ${errorMsg}. (کد آزمایشی: ${code})`,
    };
  } catch (err: any) {
    console.error('[Kavenegar Network Exception]', err);
    return {
      success: true,
      simulated: true,
      code,
      message: `خطای شبکه در اتصال به کاوه نگار. (کد آزمایشی: ${code})`,
    };
  }
}
