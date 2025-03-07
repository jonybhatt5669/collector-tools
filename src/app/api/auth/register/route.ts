import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/send-mail";
import { generateVerificationToken } from "@/lib/token";
import { UserSchema } from "@/lib/validations/auth-validation";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validateData = UserSchema.safeParse(body);

  if (!validateData.success && !validateData.data) {
    return new Response(
      JSON.stringify(validateData.error.issues.map((msg) => msg.message)),
      {
        status: 400,
        statusText: "Invalid data",
      }
    );
  }
  const { email, name, image, password } = validateData.data;
  try {
    // Exist User with given email
    const existUser = await prisma.user.findUnique({ where: { email } });

    if (existUser) {
      return new Response(null, {
        status: 204,
        statusText: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password as string, 10);
    // Create a new user
    await prisma.user.create({
      data: {
        name,
        email,
        image,
        password: hashedPassword,
      },
    });

    const otp = await generateVerificationToken(email);
    // Send the verification email
    await sendMail({ sendTo: email, text: otp.token });

    return new Response(null, {
      status: 201,
      statusText: "Please verify your email",
    });
  } catch (error) {
    console.error(error);
    return new Response("Server Error", {
      status: 500,
      statusText: "Server Error",
    });
  }
}
