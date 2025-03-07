import { prisma } from "./prisma";

export const generateVerificationToken = async (email: string) => {
  const otp = crypto.randomUUID().toString();
  const expires = new Date().getTime() + 1000 * 60 * 60 * 1;

  const existToken = await getVerificationToken(email);

  if (existToken) {
    await prisma.verificationToken.delete({
      where: {
        id: existToken.id,
      },
    });
  }

  //  Create Verification token save to database
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires: new Date(expires),
    },
  });

  return verificationToken;
};

async function getVerificationToken(email: string) {
  try {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
      },
    });

    return verificationToken;
  } catch (error) {
    console.log(error);
  }
}
