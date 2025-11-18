import Layout from "@/components/Layout";
import Link from "next/link";

export default function Products() {
  return (
    <Layout>
      <Link className="btn-primary" href={'/products/new'} >
        Add New Product
      </Link>
    </Layout>
  );
}