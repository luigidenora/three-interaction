import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy Event Binding',
    Svg: require('@site/static/img/undraw_japan_ubgk.svg').default,
    description: (
      <>
        Three-Interaction simplifies event binding, allowing developers to easily associate events with specific
        actions. The intuitive API enables seamless event management and accelerates the development process.
      </>
    ),
  },
  {
    title: 'Smart Rendering Optimization',
    Svg: require('@site/static/img/undraw_smart_resize_re_q4mo.svg').default,
    description: (
      <>
        Three-Interaction includes a smart rendering system that optimizes performance by dynamically adjusting
        rendering based on scene changes and user interactions. Enjoy smooth and responsive rendering in your Three.js
        projects.
      </>
    ),
  },
  {
    title: 'Customizable Raycasting',
    Svg: require('@site/static/img/undraw_advanced_customization_re_wo6h.svg').default,
    description: (
      <>
        With Three-Interaction, developers have powerful control over raycasting. Precisely detect intersections between
        rays and scene objects, enabling advanced interactions like object selection and position-based behaviors.
      </>
    ),
  },
  {
    title: 'Efficient Hitbox Usage',
    Svg: require('@site/static/img/undraw_breaking_barriers_vnf3.svg').default,
    description: (
      <>
        Three-Interaction simplifies collision detection and event handling through hitboxes. Easily associate hitboxes
        with objects in the scene for accurate collision detection and seamless interaction based on object positions.
      </>
    ),
  },
  {
    title: 'Focus Control for Enhanced Interaction',
    Svg: require('@site/static/img/undraw_to_the_moon_re_q21i.svg').default,
    description: (
      <>
        Take advantage of Three-Interaction's built-in focus system to manage object focus in the scene. Enable features
        like keyboard navigation, object selection, and focused interaction on specific elements for a rich user
        experience.
      </>
    ),
  },
  {
    title: 'Simplified Drag and Drop',
    Svg: require('@site/static/img/undraw_visionary_technology_re_jfp7.svg').default,
    description: (
      <>
        Three-Interaction provides an intuitive implementation of drag and drop functionality within the Three.js
        environment. Easily configure draggable objects and define drop areas, enhancing user interaction with scene
        elements.
      </>
    ),
  },
  {
    title: 'Flexible Droptarget Integration',
    Svg: require('@site/static/img/undraw_fast_re_lywu.svg').default,
    description: (
      <>
        Three-Interaction's droptarget module enables seamless integration of specific drop targets for drag and drop
        interactions. Create complex environments with defined interaction zones, opening up possibilities for engaging
        applications.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
