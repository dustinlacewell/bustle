import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Heading from "@theme/Heading"
import Layout from "@theme/Layout"
import clsx from "clsx"
import type { ReactNode } from "react"

import styles from "./index.module.css"

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext()
    return (
        <header className={clsx("hero hero--primary", styles.heroBanner)}>
            <div className="container">
                <Heading as="h1" className="hero__title">
                    <img src="img/logo.png" alt="Bustle Logo" />
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttonsGroup}>
                    <div className={styles.buttons}>
                        <Link
                            className="button button--secondary button--lg"
                            to="/docs/intro"
                        >
                            Getting Started - 5min ⏱️
                        </Link>
                    </div>
                    <div className={styles.buttons}>
                        <Link
                            className="button button--secondary button--lg"
                            to="https://github.com/dustinlacewell/bustle/releases/tag/latest"
                        >
                            Latest Release 📦
                        </Link>
                        <Link
                            className="button button--secondary button--lg"
                            to="https://github.com/dustinlacewell/bustle/releases/tag/dev"
                        >
                            Dev Build 📦
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext()
    return (
        <Layout
            description="Everything yomi hustle modding"
        >
            <HomepageHeader />
        </Layout>
    )
}
